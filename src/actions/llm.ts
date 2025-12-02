"use server";

import { llmService } from "@/src/lib/services";
import type { LLMRequest } from "@/src/lib/services/ai/types";

export const getLLMResponse = async (request: LLMRequest) => {
	return llmService.getResponse(request);
};
