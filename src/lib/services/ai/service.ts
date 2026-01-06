import { auth } from "@clerk/nextjs/server";
import type { LLMDeps } from "./deps";
import { formatLLMRequest, validateLLMResponse } from "./internal";
import type { LLMRequest, LLMResponse } from "./types";

export type ILLMService = {
	getResponse: (request: LLMRequest) => Promise<LLMResponse>;
	getResponseStream?: (request: LLMRequest) => AsyncIterable<string>;
};

export const createLLMService = (deps: LLMDeps): ILLMService => {
	const { config: llmConfig } = deps;

	const getResponse = async (request: LLMRequest): Promise<LLMResponse> => {
		const { userId } = await auth();

		if (!userId) {
			throw new Error("Unauthorized - User must be authenticated");
		}

		const model = request.model || llmConfig.model;
		const temperature = request.temperature ?? llmConfig.temperature;
		const maxTokens = request.maxTokens ?? llmConfig.maxTokens;

		const formattedRequest = formatLLMRequest(
			request.prompt,
			model,
			temperature,
			maxTokens,
			userId,
		);

		const apiKey = llmConfig.apiKey || process.env.GEMINI_API_KEY;
		if (!apiKey) {
			throw new Error("Gemini API key not configured");
		}

		// Convert model name to API format (e.g., "gemini-2.0-flash" -> "gemini-2.0-flash")
		const modelName = model.startsWith("gemini-") ? model : `gemini-${model}`;

		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					contents: [
						{
							role: "user",
							parts: [
								{
									text: formattedRequest.prompt,
								},
							],
						},
					],
					generationConfig: {
						temperature: formattedRequest.temperature,
						maxOutputTokens: formattedRequest.max_tokens,
					},
				}),
			},
		);

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`LLM API error: ${response.statusText} - ${error}`);
		}

		const data = await response.json();

		const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

		return validateLLMResponse({
			content,
			userId,
			timestamp: new Date(),
		});
	};

	return {
		getResponse,
	};
};
