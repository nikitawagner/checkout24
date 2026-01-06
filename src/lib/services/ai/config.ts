export const LLM_CONFIG = {
	model: "gemini-2.0-flash",
	temperature: 0.7,
	maxTokens: 1000,
	defaultProvider: "gemini",
} as const;

export type LLMConfig = {
	model: string;
	temperature: number;
	maxTokens: number;
	defaultProvider: string;
	apiKey?: string;
};
