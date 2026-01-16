"use client";

import { useCallback, useState } from "react";
import type { ChatMessage } from "@/lib/types/insurance";

export const useInsuranceChatHistory = (insuranceCompanyId: string) => {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isInitialized, setIsInitialized] = useState(true);

	const addMessage = useCallback(
		(role: "user" | "assistant", content: string) => {
			const newMessage: ChatMessage = {
				id: crypto.randomUUID(),
				role,
				content,
				timestamp: Date.now(),
			};

			setMessages((currentMessages) => [...currentMessages, newMessage]);

			return newMessage;
		},
		[],
	);

	const clearHistory = useCallback(() => {
		setMessages([]);
	}, []);

	return {
		messages,
		addMessage,
		clearHistory,
		isInitialized,
	};
};
