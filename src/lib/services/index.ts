import { createClient } from "@supabase/supabase-js";

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const storageService = createStorageService({
	supabase,
	config: {
		...STORAGE_CONFIG,
		supabaseUrl,
		supabaseAnonKey,
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
