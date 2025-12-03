export const EMBEDDING_CONFIG = {
	model: "text-embedding-3-small",
	dimensions: 1536,
	provider: "openai",
} as const;

export type EmbeddingConfig = {
	model: string;
	dimensions: number;
	provider: string;
	apiKey?: string;
};
