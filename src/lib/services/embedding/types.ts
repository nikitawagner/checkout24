export type EmbeddingRequest = {
	text: string;
	model?: string;
	dimensions?: number;
};

export type EmbeddingResponse = {
	embedding: number[];
	userId: string;
	timestamp: Date;
};

export type EmbeddingBatchRequest = {
	texts: string[];
	model?: string;
	dimensions?: number;
};

export type EmbeddingBatchResponse = {
	embeddings: number[][];
	userId: string;
	timestamp: Date;
};
