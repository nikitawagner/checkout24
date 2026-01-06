import type { LLMResponse } from "./types";

export const validateLLMResponse = (response: unknown): LLMResponse => {
	if (!response || typeof response !== "object") {
		throw new Error("Invalid LLM response: response is not an object");
	}

	const resp = response as Record<string, unknown>;

	if (typeof resp.content !== "string") {
		throw new Error("Invalid LLM response: content is not a string");
	}

	if (typeof resp.userId !== "string") {
		throw new Error("Invalid LLM response: userId is not a string");
	}

	return {
		content: resp.content,
		userId: resp.userId,
		timestamp:
			resp.timestamp instanceof Date
				? resp.timestamp
				: new Date(resp.timestamp as string),
	};
};

export const formatLLMRequest = (
	prompt: string,
	model: string,
	temperature: number,
	maxTokens: number,
	userId: string,
) => {
	return {
		messages: [
			{
				role: "user" as const,
				content: prompt,
			},
		],
		prompt,
		model,
		temperature,
		max_tokens: maxTokens,
		user: userId,
	};
};
