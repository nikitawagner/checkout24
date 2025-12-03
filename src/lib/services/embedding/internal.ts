import type { EmbeddingBatchResponse, EmbeddingResponse } from "./types";

export const validateEmbeddingResponse = (
	response: unknown,
): EmbeddingResponse => {
	if (!response || typeof response !== "object") {
		throw new Error("Invalid embedding response: response is not an object");
	}

	const resp = response as Record<string, unknown>;

	if (!Array.isArray(resp.embedding)) {
		throw new Error("Invalid embedding response: embedding is not an array");
	}

	if (typeof resp.userId !== "string") {
		throw new Error("Invalid embedding response: userId is not a string");
	}

	return {
		embedding: resp.embedding as number[],
		userId: resp.userId,
		timestamp:
			resp.timestamp instanceof Date
				? resp.timestamp
				: new Date(resp.timestamp as string),
	};
};

export const validateEmbeddingBatchResponse = (
	response: unknown,
): EmbeddingBatchResponse => {
	if (!response || typeof response !== "object") {
		throw new Error(
			"Invalid embedding batch response: response is not an object",
		);
	}

	const resp = response as Record<string, unknown>;

	if (!Array.isArray(resp.embeddings)) {
		throw new Error(
			"Invalid embedding batch response: embeddings is not an array",
		);
	}

	if (typeof resp.userId !== "string") {
		throw new Error("Invalid embedding batch response: userId is not a string");
	}

	return {
		embeddings: resp.embeddings as number[][],
		userId: resp.userId,
		timestamp:
			resp.timestamp instanceof Date
				? resp.timestamp
				: new Date(resp.timestamp as string),
	};
};

export const formatEmbeddingRequest = (
	text: string,
	model: string,
	dimensions: number,
) => {
	return {
		input: text,
		model,
		dimensions,
	};
};

export const formatEmbeddingBatchRequest = (
	texts: string[],
	model: string,
	dimensions: number,
) => {
	return {
		input: texts,
		model,
		dimensions,
	};
};
