import { auth } from "@clerk/nextjs/server";
import type { EmbeddingDeps } from "./deps";
import {
	formatEmbeddingBatchRequest,
	formatEmbeddingRequest,
	validateEmbeddingBatchResponse,
	validateEmbeddingResponse,
} from "./internal";
import type {
	EmbeddingBatchRequest,
	EmbeddingBatchResponse,
	EmbeddingRequest,
	EmbeddingResponse,
} from "./types";

export type IEmbeddingService = {
	generate: (request: EmbeddingRequest) => Promise<EmbeddingResponse>;
	generateBatch: (
		request: EmbeddingBatchRequest,
	) => Promise<EmbeddingBatchResponse>;
};

export const createEmbeddingService = (
	deps: EmbeddingDeps,
): IEmbeddingService => {
	const { config: embeddingConfig } = deps;

	const generate = async (
		request: EmbeddingRequest,
	): Promise<EmbeddingResponse> => {
		const { userId } = await auth();

		if (!userId) {
			throw new Error("Unauthorized - User must be authenticated");
		}

		const model = request.model || embeddingConfig.model;
		const dimensions = request.dimensions ?? embeddingConfig.dimensions;

		const formattedRequest = formatEmbeddingRequest(
			request.text,
			model,
			dimensions,
		);

		const apiKey = embeddingConfig.apiKey;
		if (!apiKey) {
			throw new Error("Embedding API key not configured");
		}

		const response = await fetch(
			"https://api.openai.com/v1/embeddings",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					input: request.text,
					model: model,
					dimensions: dimensions,
				}),
			},
		);

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Embedding API error: ${response.statusText} - ${error}`);
		}

		const data = await response.json();

		const embedding = data.data[0]?.embedding || [];

		return validateEmbeddingResponse({
			embedding,
			userId,
			timestamp: new Date(),
		});
	};

	const generateBatch = async (
		request: EmbeddingBatchRequest,
	): Promise<EmbeddingBatchResponse> => {
		const { userId } = await auth();

		if (!userId) {
			throw new Error("Unauthorized - User must be authenticated");
		}

		const model = request.model || embeddingConfig.model;
		const dimensions = request.dimensions ?? embeddingConfig.dimensions;

		const formattedRequest = formatEmbeddingBatchRequest(
			request.texts,
			model,
			dimensions,
		);

		const apiKey = embeddingConfig.apiKey;
		if (!apiKey) {
			throw new Error("Embedding API key not configured");
		}

		const response = await fetch(
			"https://api.openai.com/v1/embeddings",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					input: request.texts,
					model: model,
					dimensions: dimensions,
				}),
			},
		);

		if (!response.ok) {
			const error = await response.text();
			throw new Error(
				`Embedding API error: ${response.statusText} - ${error}`,
			);
		}

		const data = await response.json();

		const embeddings = data.data.map((item: { embedding: number[] }) => item.embedding);

		return validateEmbeddingBatchResponse({
			embeddings,
			userId,
			timestamp: new Date(),
		});
	};

	return {
		generate,
		generateBatch,
	};
};
