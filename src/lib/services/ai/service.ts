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

		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${llmConfig.apiKey || process.env.OPENAI_API_KEY}`,
			},
			body: JSON.stringify(formattedRequest),
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`LLM API error: ${response.statusText} - ${error}`);
		}

		const data = await response.json();

		const content = data.choices?.[0]?.message?.content || "";

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
