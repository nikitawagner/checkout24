"use client";

import { useCallback, useState } from "react";
import { getLLMResponse } from "@/src/actions/llm";
import type { LLMRequest, LLMResponse } from "@/src/lib/services/ai/types";

export const useLLM = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const getResponse = useCallback(async (request: LLMRequest) => {
		setIsLoading(true);
		setError(null);

		try {
			const result = await getLLMResponse(request);
			return result;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to get LLM response";
			setError(errorMessage);
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, []);

	return {
		getResponse,
		isLoading,
		error,
	};
};
