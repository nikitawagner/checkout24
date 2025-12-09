"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { extractText, getDocumentProxy } from "unpdf";

import { db } from "@/src/db";
import {
	insuranceCompaniesTable,
	policyEmbeddingsTable,
	policyFilesTable,
} from "@/src/db/schema";
import { embeddingService } from "@/src/lib/services";
import { chunkText } from "@/src/lib/utils/text-chunking";

export type UpdateInsuranceRequest = {
	companyName: string;
	insuranceName: string;
	insuranceDescription: string;
	categories: string[];
	monthlyPriceInCents: number;
	coveragePercentage: number;
	deductibleInCents: number;
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
				monthlyPriceInCents: request.monthlyPriceInCents,
				coveragePercentage: request.coveragePercentage,
				deductibleInCents: request.deductibleInCents,
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
}
