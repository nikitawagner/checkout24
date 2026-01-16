"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { extractText, getDocumentProxy } from "unpdf";

import { db } from "@/src/db";
import {
	insuranceCompaniesTable,
	policyEmbeddingsTable,
	policyFilesTable,
} from "@/src/db/schema";
import { embeddingService, llmService } from "@/src/lib/services";
import { chunkText } from "@/src/lib/utils/text-chunking";

export type UpdateInsuranceRequest = {
	companyName: string;
	insuranceName: string;
	insuranceDescription: string;
	categories: string[];
	yearlyPriceInCents: number;
	twoYearlyPriceInCents: number;
	coveragePercentage: number;
	deductibleInCents: number;
	coverageDescription?: string;
	rightOfWithdrawal?: string;
	isActive: number;
	apiEndpoint: string;
};

export async function updateInsuranceCompany(
	insuranceId: string,
	request: UpdateInsuranceRequest,
): Promise<{ success: boolean; error?: string }> {
	const { userId } = await auth();

	if (!userId) {
		return {
			success: false,
			error: "Unauthorized - User must be authenticated",
		};
	}

	try {
		const existingCompanyResults = await db
			.select({ id: insuranceCompaniesTable.id })
			.from(insuranceCompaniesTable)
			.where(eq(insuranceCompaniesTable.id, insuranceId))
			.limit(1);

		const existingCompany = existingCompanyResults.at(0);

		if (!existingCompany) {
			return { success: false, error: "Insurance company not found" };
		}

		await db
			.update(insuranceCompaniesTable)
			.set({
				companyName: request.companyName,
				insuranceName: request.insuranceName,
				insuranceDescription: request.insuranceDescription,
				categories: request.categories,
				yearlyPriceInCents: request.yearlyPriceInCents,
				twoYearlyPriceInCents: request.twoYearlyPriceInCents,
				coveragePercentage: request.coveragePercentage,
				deductibleInCents: request.deductibleInCents,
				coverageDescription: request.coverageDescription,
				rightOfWithdrawal: request.rightOfWithdrawal,
				isActive: request.isActive,
				apiEndpoint: request.apiEndpoint,
			})
			.where(eq(insuranceCompaniesTable.id, insuranceId));

		return { success: true };
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "An unexpected error occurred";

		return { success: false, error: errorMessage };
	}
}

const EMBEDDING_BATCH_SIZE = 20;
const MAX_CONTEXT_CHUNKS = 15;

export async function generateInsuranceSummaryAndReasons(
	insuranceCompanyId: string,
): Promise<{ summary: string; reasons: string[] }> {
	const allEmbeddings = await db
		.select({
			chunkText: policyEmbeddingsTable.chunkText,
		})
		.from(policyEmbeddingsTable)
		.innerJoin(
			policyFilesTable,
			eq(policyEmbeddingsTable.policyFileId, policyFilesTable.id),
		)
		.where(eq(policyFilesTable.insuranceCompanyId, insuranceCompanyId))
		.limit(MAX_CONTEXT_CHUNKS);

	if (allEmbeddings.length === 0) {
		throw new Error("No embeddings found for this insurance company");
	}

	const contextText = allEmbeddings
		.map((embedding) => embedding.chunkText)
		.join("\n\n---\n\n");

	const prompt = `Given the following insurance policy excerpts:

${contextText}

Analyze these policy documents and provide:

1. A comprehensive summary (2-3 sentences) explaining what this insurance covers and its key benefits
2. The top 3 most important reasons why someone should choose this insurance

IMPORTANT: Provide your response in German (auf Deutsch).

Response format (use exactly this structure):
SUMMARY: [your 2-3 sentence summary here in German]
TOP_REASONS:
- [reason 1 in German]
- [reason 2 in German]
- [reason 3 in German]`;

	const llmResponse = await llmService.getResponse({ prompt });

	const summaryMatch = llmResponse.content.match(
		/SUMMARY:\s*([\s\S]+?)(?=TOP_REASONS:|$)/,
	);
	const reasonsMatch = llmResponse.content.match(/TOP_REASONS:\s*([\s\S]+)/);

	const summary = summaryMatch?.at(1)?.trim() ?? "";
	const reasonsText = reasonsMatch?.at(1)?.trim() ?? "";

	const reasons = reasonsText
		.split("\n")
		.map((line) => line.replace(/^-\s*/, "").trim())
		.filter((line) => line.length > 0)
		.slice(0, 3);

	return { summary, reasons };
}

export async function processPolicyFile(policyFileId: string): Promise<void> {
	const { userId } = await auth();

	if (!userId) {
		throw new Error("Unauthorized - User must be authenticated");
	}

	const policyFileResults = await db
		.select()
		.from(policyFilesTable)
		.where(eq(policyFilesTable.id, policyFileId))
		.limit(1);

	const policyFile = policyFileResults.at(0);

	if (!policyFile) {
		throw new Error("Policy file not found");
	}

	if (policyFile.isProcessed === 1) {
		throw new Error("Policy file has already been processed");
	}

	const pdfResponse = await fetch(policyFile.storageUrl);

	if (!pdfResponse.ok) {
		throw new Error(`Failed to fetch PDF: ${pdfResponse.statusText}`);
	}

	const pdfArrayBuffer = await pdfResponse.arrayBuffer();
	const pdfUint8Array = new Uint8Array(pdfArrayBuffer);

	const pdfDocument = await getDocumentProxy(pdfUint8Array);
	const { text: extractedText } = await extractText(pdfDocument, {
		mergePages: true,
	});

	if (!extractedText || extractedText.trim().length === 0) {
		throw new Error("No text could be extracted from the PDF");
	}

	const textChunks = chunkText(extractedText);

	const chunkBatches: Array<typeof textChunks> = [];
	const totalChunks = textChunks.length;

	for (
		let batchStart = 0;
		batchStart < totalChunks;
		batchStart += EMBEDDING_BATCH_SIZE
	) {
		chunkBatches.push(
			textChunks.slice(batchStart, batchStart + EMBEDDING_BATCH_SIZE),
		);
	}

	for (const chunkBatch of chunkBatches) {
		const textsToEmbed = chunkBatch.map((chunk) => chunk.text);

		const embeddingResponse = await embeddingService.generateBatch({
			texts: textsToEmbed,
		});

		const embeddingRecords = chunkBatch.map((chunk, batchIndex) => ({
			policyFileId: policyFile.id,
			chunkIndex: chunk.index,
			chunkText: chunk.text,
			embedding: embeddingResponse.embeddings.at(batchIndex) ?? [],
		}));

		await db.insert(policyEmbeddingsTable).values(embeddingRecords);
	}

	await db
		.update(policyFilesTable)
		.set({ isProcessed: 1 })
		.where(eq(policyFilesTable.id, policyFileId));

	const { summary, reasons } = await generateInsuranceSummaryAndReasons(
		policyFile.insuranceCompanyId,
	);

	await db
		.update(insuranceCompaniesTable)
		.set({
			generatedSummary: summary,
			topReasons: reasons,
		})
		.where(eq(insuranceCompaniesTable.id, policyFile.insuranceCompanyId));
}

export async function regenerateInsuranceSummary(
	insuranceId: string,
): Promise<{ success: boolean; error?: string }> {
	const { userId } = await auth();

	if (!userId) {
		return {
			success: false,
			error: "Unauthorized - User must be authenticated",
		};
	}

	try {
		const existingCompanyResults = await db
			.select({ id: insuranceCompaniesTable.id })
			.from(insuranceCompaniesTable)
			.where(eq(insuranceCompaniesTable.id, insuranceId))
			.limit(1);

		const existingCompany = existingCompanyResults.at(0);

		if (!existingCompany) {
			return { success: false, error: "Insurance company not found" };
		}

		const processedPolicyFiles = await db
			.select({ id: policyFilesTable.id })
			.from(policyFilesTable)
			.where(
				and(
					eq(policyFilesTable.insuranceCompanyId, insuranceId),
					eq(policyFilesTable.isProcessed, 1),
				),
			)
			.limit(1);

		if (processedPolicyFiles.length === 0) {
			return {
				success: false,
				error:
					"No processed policy files found. Please process at least one policy file first.",
			};
		}

		const { summary, reasons } =
			await generateInsuranceSummaryAndReasons(insuranceId);

		await db
			.update(insuranceCompaniesTable)
			.set({
				generatedSummary: summary,
				topReasons: reasons,
			})
			.where(eq(insuranceCompaniesTable.id, insuranceId));

		return { success: true };
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "An unexpected error occurred";

		return { success: false, error: errorMessage };
	}
}

export async function reprocessPolicyDocuments(
	insuranceId: string,
): Promise<{ success: boolean; error?: string }> {
	const { userId } = await auth();

	if (!userId) {
		return {
			success: false,
			error: "Unauthorized - User must be authenticated",
		};
	}

	try {
		const existingCompanyResults = await db
			.select({ id: insuranceCompaniesTable.id })
			.from(insuranceCompaniesTable)
			.where(eq(insuranceCompaniesTable.id, insuranceId))
			.limit(1);

		const existingCompany = existingCompanyResults.at(0);

		if (!existingCompany) {
			return { success: false, error: "Insurance company not found" };
		}

		const policyFiles = await db
			.select({ id: policyFilesTable.id })
			.from(policyFilesTable)
			.where(eq(policyFilesTable.insuranceCompanyId, insuranceId));

		if (policyFiles.length === 0) {
			return {
				success: false,
				error: "No policy files found to reprocess",
			};
		}

		for (const policyFile of policyFiles) {
			await db
				.delete(policyEmbeddingsTable)
				.where(eq(policyEmbeddingsTable.policyFileId, policyFile.id));
		}

		await db
			.update(policyFilesTable)
			.set({ isProcessed: 0 })
			.where(eq(policyFilesTable.insuranceCompanyId, insuranceId));

		for (const policyFile of policyFiles) {
			await processPolicyFile(policyFile.id);
		}

		return { success: true };
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "An unexpected error occurred";

		return { success: false, error: errorMessage };
	}
}

export async function deleteInsuranceCompany(
	insuranceId: string,
): Promise<{ success: boolean; error?: string }> {
	const { userId } = await auth();

	if (!userId) {
		return {
			success: false,
			error: "Unauthorized - User must be authenticated",
		};
	}

	try {
		const existingCompanyResults = await db
			.select({ id: insuranceCompaniesTable.id })
			.from(insuranceCompaniesTable)
			.where(eq(insuranceCompaniesTable.id, insuranceId))
			.limit(1);

		const existingCompany = existingCompanyResults.at(0);

		if (!existingCompany) {
			return { success: false, error: "Insurance company not found" };
		}

		const policyFiles = await db
			.select({ id: policyFilesTable.id })
			.from(policyFilesTable)
			.where(eq(policyFilesTable.insuranceCompanyId, insuranceId));

		for (const policyFile of policyFiles) {
			await db
				.delete(policyEmbeddingsTable)
				.where(eq(policyEmbeddingsTable.policyFileId, policyFile.id));
		}

		await db
			.delete(policyFilesTable)
			.where(eq(policyFilesTable.insuranceCompanyId, insuranceId));

		await db
			.delete(insuranceCompaniesTable)
			.where(eq(insuranceCompaniesTable.id, insuranceId));

		return { success: true };
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "An unexpected error occurred";

		return { success: false, error: errorMessage };
	}
}
