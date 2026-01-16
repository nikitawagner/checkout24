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
import { searchPolicyEmbeddingsHybrid } from "@/src/lib/utils/vector-search";

const QUERY_SYNONYMS: Record<string, string[]> = {
	geklaut: ["diebstahl", "raub", "gestohlen", "entwendet"],
	gestohlen: ["diebstahl", "raub", "geklaut", "entwendet"],
	kaputt: ["beschädigung", "defekt", "bruch", "schaden"],
	beschädigt: ["beschädigung", "defekt", "bruch", "schaden", "kaputt"],
	nass: ["wasserschaden", "feuchtigkeit", "flüssigkeit", "wasser"],
	wasserschaden: ["nass", "feuchtigkeit", "flüssigkeit", "wasser"],
	"runter gefallen": ["sturz", "fall", "beschädigung", "heruntergefallen"],
	gefallen: ["sturz", "fall", "beschädigung"],
	display: ["bildschirm", "anzeige", "screen"],
	bildschirm: ["display", "anzeige", "screen"],
	reparatur: ["instandsetzung", "wiederherstellung", "reparieren"],
	verloren: ["verlust", "vermisst", "weg"],
	verlust: ["verloren", "vermisst", "weg"],
};

const expandQueryWithSynonyms = (query: string): string => {
	const lowerQuery = query.toLowerCase();
	const words = lowerQuery.split(/\s+/);

	const expandedTerms = new Set<string>([query]);

	for (const [key, synonyms] of Object.entries(QUERY_SYNONYMS)) {
		if (lowerQuery.includes(key)) {
			for (const synonym of synonyms) {
				expandedTerms.add(synonym);
			}
		}
	}

	for (const word of words) {
		const synonyms = QUERY_SYNONYMS[word];

		if (synonyms) {
			for (const synonym of synonyms) {
				expandedTerms.add(synonym);
			}
		}
	}

	return [...expandedTerms].join(" ");
};

const calculateValueScore = (
	coveragePercentage: number,
	yearlyPriceInCents: number,
	deductibleInCents: number,
	productPriceInCents: number,
): number => {
	const coverageValue = (coveragePercentage / 100) * productPriceInCents;
	const effectiveDeductible = Math.min(deductibleInCents, productPriceInCents);
	const netCoverageValue = coverageValue - effectiveDeductible;

	if (yearlyPriceInCents === 0) {
		return 0;
	}

	return netCoverageValue / yearlyPriceInCents;
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
				coverageDescription: insuranceCompaniesTable.coverageDescription,
				generatedSummary: insuranceCompaniesTable.generatedSummary,
				topReasons: insuranceCompaniesTable.topReasons,
				rightOfWithdrawal: insuranceCompaniesTable.rightOfWithdrawal,
				categories: insuranceCompaniesTable.categories,
				yearlyPriceInCents: insuranceCompaniesTable.yearlyPriceInCents,
				twoYearlyPriceInCents: insuranceCompaniesTable.twoYearlyPriceInCents,
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
						insurance.yearlyPriceInCents !== null &&
						insurance.twoYearlyPriceInCents !== null &&
						insurance.coveragePercentage !== null &&
						insurance.deductibleInCents !== null,
				)
				.map((insurance) => ({
					insuranceCompanyId: insurance.id,
					companyName: insurance.companyName,
					insuranceName: insurance.insuranceName ?? "",
					insuranceDescription: insurance.insuranceDescription ?? "",
					coverageDescription: insurance.coverageDescription,
					generatedSummary: insurance.generatedSummary,
					topReasons: insurance.topReasons,
					rightOfWithdrawal: insurance.rightOfWithdrawal,
					yearlyPriceInCents: insurance.yearlyPriceInCents ?? 0,
					twoYearlyPriceInCents: insurance.twoYearlyPriceInCents ?? 0,
					coveragePercentage: insurance.coveragePercentage ?? 0,
					deductibleInCents: insurance.deductibleInCents ?? 0,
					valueScore: calculateValueScore(
						insurance.coveragePercentage ?? 0,
						insurance.yearlyPriceInCents ?? 0,
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

		const relevantChunks = await searchPolicyEmbeddingsHybrid({
			queryEmbedding: embeddingResponse.embedding,
			insuranceCompanyId,
			userQuery: searchQuery,
			topK: 10,
			similarityThreshold: 0.6,
		});

		const contextText = relevantChunks
			.map((chunk) => chunk.chunkText)
			.join("\n\n---\n\n");

		const prompt = `Given the following policy excerpts for "${insurance.insuranceName}" from ${insurance.companyName}:

${contextText}

Generate a concise summary (2-3 sentences) explaining why this insurance is a good fit for a ${productName} (${productCategory}). Focus on the key coverage benefits that are most relevant for this type of device.

Also provide exactly 3 key coverage highlights as short bullet points.

IMPORTANT: Provide your response in German (auf Deutsch).

Response format (use exactly this structure):
SUMMARY: [your 2-3 sentence summary here in German]
HIGHLIGHTS:
- [highlight 1 in German]
- [highlight 2 in German]
- [highlight 3 in German]`;

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
		console.log("[RAG Debug] User question:", question);

		const insuranceResult = await db
			.select({
				companyName: insuranceCompaniesTable.companyName,
				insuranceName: insuranceCompaniesTable.insuranceName,
			})
			.from(insuranceCompaniesTable)
			.where(eq(insuranceCompaniesTable.id, insuranceCompanyId));

		const insurance = insuranceResult.at(0);

		if (!insurance) {
			console.error("[RAG Debug] Insurance company not found:", insuranceCompanyId);
			return {
				success: false,
				error: new Error("Insurance company not found"),
			};
		}

		console.log(
			`[RAG Debug] Insurance: ${insurance.companyName} - ${insurance.insuranceName}`,
		);

		const expandedQuery = expandQueryWithSynonyms(question);

		console.log("[RAG Debug] Original query:", question);
		console.log("[RAG Debug] Expanded query:", expandedQuery);

		const embeddingResponse = await embeddingService.generate({
			text: expandedQuery,
		});

		console.log(
			"[RAG Debug] Generated embedding with",
			embeddingResponse.embedding.length,
			"dimensions",
		);

		const relevantChunks = await searchPolicyEmbeddingsHybrid({
			queryEmbedding: embeddingResponse.embedding,
			insuranceCompanyId,
			userQuery: question,
			topK: 10,
			similarityThreshold: 0.6,
		});

		console.log("[RAG Debug] Found", relevantChunks.length, "relevant chunks");

		relevantChunks.forEach((chunk, index) => {
			console.log(`[RAG Debug] Chunk ${index + 1}:`, {
				similarityScore: chunk.similarityScore.toFixed(3),
				chunkIndex: chunk.chunkIndex,
				textPreview: chunk.chunkText.substring(0, 150) + "...",
			});
		});

		if (relevantChunks.length === 0) {
			console.warn(
				"[RAG Debug] No relevant chunks found - returning fallback message",
			);
			return {
				success: true,
				data: "Entschuldigung, ich konnte keine relevanten Informationen in den Versicherungsdokumenten finden. Bitte kontaktieren Sie unseren Kundenservice für detaillierte Informationen.",
			};
		}

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
6. ALWAYS respond in German (auf Deutsch)

Policy Context:
${contextText}

${chatHistoryText ? `Previous conversation:\n${chatHistoryText}\n\n` : ""}User question: ${question}

Provide a helpful, accurate response in German:`;

		const llmResponse = await llmService.getResponse({ prompt });

		return { success: true, data: llmResponse.content };
	} catch (error) {
		console.error("Error in askInsuranceQuestion:", error);
		return {
			success: false,
			error: error instanceof Error ? error : new Error("Unknown error"),
		};
	}
}
