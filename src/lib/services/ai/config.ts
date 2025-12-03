export const LLM_CONFIG = {
	model: "gpt-4",
	temperature: 0.7,
	maxTokens: 1000,
	defaultProvider: "openai",
} as const;

export type LLMConfig = {
	model: string;
	temperature: number;
	maxTokens: number;
	defaultProvider: string;
	apiKey?: string;
};
