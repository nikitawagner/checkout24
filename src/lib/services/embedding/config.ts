export const EMBEDDING_CONFIG = {
	model: "embedding-001",
	dimensions: 768,
	provider: "gemini",
} as const;

export type EmbeddingConfig = {
	model: string;
	dimensions: number;
	provider: string;
	apiKey?: string;
};
