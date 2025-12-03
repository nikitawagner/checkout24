export type LLMRequest = {
	prompt: string;
	model?: string;
	temperature?: number;
	maxTokens?: number;
};

export type LLMResponse = {
	content: string;
	userId: string;
	timestamp: Date;
};
