"use server";

import { eq } from "drizzle-orm";
import type {
	ChatMessage,
	InsuranceRecommendation,
	InsuranceSummary,
} from "@/lib/types/insurance";
import { db } from "@/src/db";
import { insuranceCompaniesTable } from "@/src/db/schema";
import { embeddingService, llmService } from "@/src/lib/services";
import type { Result } from "@/src/lib/utils/result";
import { searchPolicyEmbeddings } from "@/src/lib/utils/vector-search";

const ANNUAL_MONTHS = 12;

const calculateValueScore = (
	coveragePercentage: number,
	monthlyPriceInCents: number,
	deductibleInCents: number,
	productPriceInCents: number,
): number => {
	const coverageValue = (coveragePercentage / 100) * productPriceInCents;
	const annualCost = monthlyPriceInCents * ANNUAL_MONTHS;
	const effectiveDeductible = Math.min(deductibleInCents, productPriceInCents);
	const netCoverageValue = coverageValue - effectiveDeductible;

	if (annualCost === 0) {
		return 0;
	}

	return netCoverageValue / annualCost;
};

export async function getRecommendedInsurances(
	productCategory: string,
	productPriceInCents: number,
): Promise<Result<InsuranceRecommendation[], Error>> {
	try {
		const insurances = await db
			.select({
				id: insuranceCompaniesTable.id,
				companyName: insuranceCompaniesTable.companyName,
				insuranceName: insuranceCompaniesTable.insuranceName,
				insuranceDescription: insuranceCompaniesTable.insuranceDescription,
				categories: insuranceCompaniesTable.categories,
				monthlyPriceInCents: insuranceCompaniesTable.monthlyPriceInCents,
				coveragePercentage: insuranceCompaniesTable.coveragePercentage,
				deductibleInCents: insuranceCompaniesTable.deductibleInCents,
				isActive: insuranceCompaniesTable.isActive,
			})
			.from(insuranceCompaniesTable)
			.where(eq(insuranceCompaniesTable.isActive, 1));

		const filteredInsurances = insurances.filter((insurance) => {
			const categories = insurance.categories ?? [];

			return categories.some(
				(category) => category.toLowerCase() === productCategory.toLowerCase(),
			);
		});

		const recommendationsWithScores: InsuranceRecommendation[] =
			filteredInsurances
				.filter(
					(insurance) =>
						insurance.monthlyPriceInCents !== null &&
						insurance.coveragePercentage !== null &&
						insurance.deductibleInCents !== null,
				)
				.map((insurance) => ({
					insuranceCompanyId: insurance.id,
					companyName: insurance.companyName,
					insuranceName: insurance.insuranceName ?? "",
					insuranceDescription: insurance.insuranceDescription ?? "",
					monthlyPriceInCents: insurance.monthlyPriceInCents ?? 0,
					coveragePercentage: insurance.coveragePercentage ?? 0,
					deductibleInCents: insurance.deductibleInCents ?? 0,
					valueScore: calculateValueScore(
						insurance.coveragePercentage ?? 0,
						insurance.monthlyPriceInCents ?? 0,
						insurance.deductibleInCents ?? 0,
						productPriceInCents,
					),
				}));

		const sortedRecommendations = [...recommendationsWithScores].sort(
			(insuranceA, insuranceB) => insuranceB.valueScore - insuranceA.valueScore,
		);

		return { success: true, data: sortedRecommendations };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error : new Error("Unknown error"),
		};
	}
}

export async function generateInsuranceSummary(
	insuranceCompanyId: string,
	productCategory: string,
	productName: string,
): Promise<Result<InsuranceSummary, Error>> {
	try {
		const insuranceResult = await db
			.select({
				companyName: insuranceCompaniesTable.companyName,
				insuranceName: insuranceCompaniesTable.insuranceName,
			})
			.from(insuranceCompaniesTable)
			.where(eq(insuranceCompaniesTable.id, insuranceCompanyId));

		const insurance = insuranceResult.at(0);

		if (!insurance) {
			return {
				success: false,
				error: new Error("Insurance company not found"),
			};
		}

		const searchQuery = `coverage benefits protection ${productCategory}`;

		const embeddingResponse = await embeddingService.generate({
			text: searchQuery,
		});

		const relevantChunks = await searchPolicyEmbeddings({
			queryEmbedding: embeddingResponse.embedding,
			insuranceCompanyId,
			topK: 5,
		});

		const contextText = relevantChunks
			.map((chunk) => chunk.chunkText)
			.join("\n\n---\n\n");

		const prompt = `Given the following policy excerpts for "${insurance.insuranceName}" from ${insurance.companyName}:

${contextText}

Generate a concise summary (2-3 sentences) explaining why this insurance is a good fit for a ${productName} (${productCategory}). Focus on the key coverage benefits that are most relevant for this type of device.

Also provide exactly 3 key coverage highlights as short bullet points.

Response format (use exactly this structure):
SUMMARY: [your 2-3 sentence summary here]
HIGHLIGHTS:
- [highlight 1]
- [highlight 2]
- [highlight 3]`;

		const llmResponse = await llmService.getResponse({ prompt });

		const summaryMatch = llmResponse.content.match(
			/SUMMARY:\s*([\s\S]+?)(?=HIGHLIGHTS:|$)/,
		);
		const highlightsMatch = llmResponse.content.match(
			/HIGHLIGHTS:\s*([\s\S]+)/,
		);

		const summary = summaryMatch?.at(1)?.trim() ?? "";
		const highlightsText = highlightsMatch?.at(1)?.trim() ?? "";

		const highlights = highlightsText
			.split("\n")
			.map((line) => line.replace(/^-\s*/, "").trim())
			.filter((line) => line.length > 0);

		return {
			success: true,
			data: {
				insuranceCompanyId,
				summary,
				highlights,
			},
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error : new Error("Unknown error"),
		};
	}
}

export async function askInsuranceQuestion(
	insuranceCompanyId: string,
	question: string,
	chatHistory: ChatMessage[],
): Promise<Result<string, Error>> {
	try {
		const insuranceResult = await db
			.select({
				companyName: insuranceCompaniesTable.companyName,
				insuranceName: insuranceCompaniesTable.insuranceName,
			})
			.from(insuranceCompaniesTable)
			.where(eq(insuranceCompaniesTable.id, insuranceCompanyId));

		const insurance = insuranceResult.at(0);

		if (!insurance) {
			return {
				success: false,
				error: new Error("Insurance company not found"),
			};
		}

		const embeddingResponse = await embeddingService.generate({
			text: question,
		});

		const relevantChunks = await searchPolicyEmbeddings({
			queryEmbedding: embeddingResponse.embedding,
			insuranceCompanyId,
			topK: 5,
		});

		const contextText = relevantChunks
			.map((chunk) => chunk.chunkText)
			.join("\n\n---\n\n");

		const chatHistoryText = chatHistory
			.map(
				(message) =>
					`${message.role === "user" ? "User" : "Assistant"}: ${message.content}`,
			)
			.join("\n");

		const prompt = `You are a knowledgeable insurance assistant for ${insurance.companyName}'s "${insurance.insuranceName}" policy.
Your role is to help customers understand their coverage options.

IMPORTANT RULES:
1. Only answer based on the policy context provided below
2. If information is not in the context, clearly state that you cannot find that specific information in the policy documents
3. Be concise but thorough
4. Use simple language, avoid jargon
5. If asked about claims or specific procedures, mention that they should contact customer service for detailed assistance

Policy Context:
${contextText}

${chatHistoryText ? `Previous conversation:\n${chatHistoryText}\n\n` : ""}User question: ${question}

Provide a helpful, accurate response:`;

		const llmResponse = await llmService.getResponse({ prompt });

		return { success: true, data: llmResponse.content };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error : new Error("Unknown error"),
		};
	}
}
