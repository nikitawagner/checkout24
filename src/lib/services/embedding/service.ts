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

		const apiKey = embeddingConfig.apiKey || process.env.GEMINI_API_KEY;
		if (!apiKey) {
			throw new Error("Embedding API key not configured");
		}

		// Convert model name to API format
		const modelName = model.startsWith("models/") ? model : `models/${model}`;

		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/${modelName}:embedContent?key=${apiKey}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					content: {
						parts: [
							{
								text: request.text,
							},
						],
					},
				}),
			},
		);

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Embedding API error: ${response.statusText} - ${error}`);
		}

		const data = await response.json();

		const embedding = data.embedding?.values || [];

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

		const apiKey = embeddingConfig.apiKey || process.env.GEMINI_API_KEY;
		if (!apiKey) {
			throw new Error("Embedding API key not configured");
		}

		const embeddings: number[][] = [];

		for (const text of request.texts) {
			// Convert model name to API format
			const modelName = model.startsWith("models/") ? model : `models/${model}`;

			const response = await fetch(
				`https://generativelanguage.googleapis.com/v1beta/${modelName}:embedContent?key=${apiKey}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						content: {
							parts: [
								{
									text: text,
								},
							],
						},
					}),
				},
			);

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`Embedding API error: ${response.statusText} - ${error}`);
			}

			const data = await response.json();
			const embedding = data.embedding?.values || [];
			embeddings.push(embedding);
		}

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
