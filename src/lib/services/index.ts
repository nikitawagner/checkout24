import { createLLMService } from "./ai";
import { LLM_CONFIG } from "./ai/config";

import { createEmailService } from "./email";
import { EMAIL_CONFIG } from "./email/config";

import { createEmbeddingService } from "./embedding";
import { EMBEDDING_CONFIG } from "./embedding/config";

import { createStorageService } from "./storage";
import { STORAGE_CONFIG } from "./storage/config";

export const llmService = createLLMService({
	config: {
		...LLM_CONFIG,
		apiKey: process.env.OPENAI_API_KEY,
	},
});

export const emailService = createEmailService({
	config: {
		...EMAIL_CONFIG,
		apiKey: process.env.RESEND_API_KEY,
	},
});

export const embeddingService = createEmbeddingService({
	config: {
		...EMBEDDING_CONFIG,
		apiKey: process.env.OPENAI_API_KEY,
	},
});

export const storageService = createStorageService({
	config: {
		...STORAGE_CONFIG,
		accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
		secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
		endpoint: process.env.STORAGE_ENDPOINT,
	},
});

export { createLLMService } from "./ai";
export * from "./ai/config";
export * from "./ai/types";
export { createEmailService } from "./email";
export * from "./email/config";
export * from "./email/types";
export { createEmbeddingService } from "./embedding";
export * from "./embedding/config";
export * from "./embedding/types";
export { createStorageService } from "./storage";
export * from "./storage/config";
export * from "./storage/types";
