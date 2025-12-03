import type { LLMConfig } from "./config";

export type LLMDeps = {
	config: LLMConfig;
	// Add other dependencies here (e.g., API clients, database, etc.)
	// openRouter?: OpenRouter;
	// db?: Database;
};
