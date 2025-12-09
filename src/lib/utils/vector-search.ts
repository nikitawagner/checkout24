import { eq } from "drizzle-orm";
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

const DEFAULT_TOP_K = 5;
const DEFAULT_SIMILARITY_THRESHOLD = 0.3;

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
