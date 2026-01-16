import { and, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/src/db";
import {
	insuranceCompaniesTable,
	policyEmbeddingsTable,
	policyFilesTable,
} from "@/src/db/schema";

export type VectorSearchResult = {
	chunkText: string;
	chunkIndex: number;
	similarityScore: number;
	policyFileId: string;
};

export type VectorSearchParams = {
	queryEmbedding: number[];
	insuranceCompanyId: string;
	topK?: number;
	similarityThreshold?: number;
};

const DEFAULT_TOP_K = 10;
const DEFAULT_SIMILARITY_THRESHOLD = 0.6;

const INSURANCE_KEYWORDS = [
	"diebstahl",
	"raub",
	"gestohlen",
	"einbruch",
	"wasserschaden",
	"wasser",
	"flüssigkeit",
	"bruch",
	"display",
	"bildschirm",
	"reparatur",
	"beschädigung",
	"schaden",
	"unfall",
	"sturz",
	"fall",
	"defekt",
	"verlust",
	"verloren",
	"elektronik",
	"akku",
	"batterie",
	"brand",
	"feuer",
	"überspannung",
	"kurzschluss",
] as const;

export const extractInsuranceKeywords = (query: string): string[] => {
	const normalizedQuery = query.toLowerCase().trim();

	const foundKeywords = INSURANCE_KEYWORDS.filter((keyword) =>
		normalizedQuery.includes(keyword),
	);

	return foundKeywords;
};

export const computeCosineSimilarity = (
	vectorA: number[],
	vectorB: number[],
): number => {
	if (vectorA.length !== vectorB.length) {
		return 0;
	}

	const dotProduct = vectorA.reduce(
		(sum, valueA, index) => sum + valueA * (vectorB.at(index) ?? 0),
		0,
	);

	const magnitudeA = Math.sqrt(
		vectorA.reduce((sum, value) => sum + value * value, 0),
	);

	const magnitudeB = Math.sqrt(
		vectorB.reduce((sum, value) => sum + value * value, 0),
	);

	if (magnitudeA === 0 || magnitudeB === 0) {
		return 0;
	}

	return dotProduct / (magnitudeA * magnitudeB);
};

export const searchPolicyEmbeddings = async (
	params: VectorSearchParams,
): Promise<VectorSearchResult[]> => {
	const {
		queryEmbedding,
		insuranceCompanyId,
		topK = DEFAULT_TOP_K,
		similarityThreshold = DEFAULT_SIMILARITY_THRESHOLD,
	} = params;

	const policyFiles = await db
		.select({ id: policyFilesTable.id })
		.from(policyFilesTable)
		.innerJoin(
			insuranceCompaniesTable,
			eq(policyFilesTable.insuranceCompanyId, insuranceCompaniesTable.id),
		)
		.where(eq(insuranceCompaniesTable.id, insuranceCompanyId));

	const policyFileIds = policyFiles.map((file) => file.id);

	if (policyFileIds.length === 0) {
		return [];
	}

	const allEmbeddings = await db
		.select({
			id: policyEmbeddingsTable.id,
			policyFileId: policyEmbeddingsTable.policyFileId,
			chunkIndex: policyEmbeddingsTable.chunkIndex,
			chunkText: policyEmbeddingsTable.chunkText,
			embedding: policyEmbeddingsTable.embedding,
		})
		.from(policyEmbeddingsTable);

	const filteredEmbeddings = allEmbeddings.filter((embedding) =>
		policyFileIds.includes(embedding.policyFileId),
	);

	const resultsWithScores = filteredEmbeddings.map((embedding) => ({
		chunkText: embedding.chunkText,
		chunkIndex: embedding.chunkIndex,
		similarityScore: computeCosineSimilarity(
			queryEmbedding,
			embedding.embedding,
		),
		policyFileId: embedding.policyFileId,
	}));

	const filteredResults = resultsWithScores.filter(
		(result) => result.similarityScore >= similarityThreshold,
	);

	const sortedResults = [...filteredResults].sort(
		(resultA, resultB) => resultB.similarityScore - resultA.similarityScore,
	);

	return sortedResults.slice(0, topK);
};

export const searchPolicyEmbeddingsHybrid = async (
	params: VectorSearchParams & { userQuery: string },
): Promise<VectorSearchResult[]> => {
	const {
		queryEmbedding,
		insuranceCompanyId,
		userQuery,
		topK = DEFAULT_TOP_K,
		similarityThreshold = DEFAULT_SIMILARITY_THRESHOLD,
	} = params;

	const policyFiles = await db
		.select({ id: policyFilesTable.id })
		.from(policyFilesTable)
		.innerJoin(
			insuranceCompaniesTable,
			eq(policyFilesTable.insuranceCompanyId, insuranceCompaniesTable.id),
		)
		.where(eq(insuranceCompaniesTable.id, insuranceCompanyId));

	const policyFileIds = policyFiles.map((file) => file.id);

	if (policyFileIds.length === 0) {
		return [];
	}

	const keywords = extractInsuranceKeywords(userQuery);

	const keywordResults: VectorSearchResult[] = [];

	if (keywords.length > 0) {
		const keywordConditions = keywords.map((keyword) =>
			ilike(policyEmbeddingsTable.chunkText, `%${keyword}%`),
		);

		const keywordChunks = await db
			.select({
				id: policyEmbeddingsTable.id,
				policyFileId: policyEmbeddingsTable.policyFileId,
				chunkIndex: policyEmbeddingsTable.chunkIndex,
				chunkText: policyEmbeddingsTable.chunkText,
				embedding: policyEmbeddingsTable.embedding,
			})
			.from(policyEmbeddingsTable)
			.where(
				and(
					sql`${policyEmbeddingsTable.policyFileId} IN ${policyFileIds}`,
					or(...keywordConditions),
				),
			);

		for (const chunk of keywordChunks) {
			const similarityScore = computeCosineSimilarity(
				queryEmbedding,
				chunk.embedding,
			);

			keywordResults.push({
				chunkText: chunk.chunkText,
				chunkIndex: chunk.chunkIndex,
				similarityScore: Math.max(similarityScore, 0.8),
				policyFileId: chunk.policyFileId,
			});
		}
	}

	const vectorResults = await searchPolicyEmbeddings({
		queryEmbedding,
		insuranceCompanyId,
		topK: topK * 2,
		similarityThreshold,
	});

	const combinedResults = [...keywordResults, ...vectorResults];

	const uniqueResults = new Map<string, VectorSearchResult>();

	for (const result of combinedResults) {
		const key = `${result.policyFileId}-${result.chunkIndex}`;

		const existing = uniqueResults.get(key);

		if (!existing || result.similarityScore > existing.similarityScore) {
			uniqueResults.set(key, result);
		}
	}

	const sortedUniqueResults = [...uniqueResults.values()].sort(
		(resultA, resultB) => resultB.similarityScore - resultA.similarityScore,
	);

	return sortedUniqueResults.slice(0, topK);
};
