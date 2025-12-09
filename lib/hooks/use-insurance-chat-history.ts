"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChatMessage, InsuranceChatHistory } from "@/lib/types/insurance";

const STORAGE_KEY = "insurance-chat-history";

const loadFromStorage = (): InsuranceChatHistory => {
	if (typeof window === "undefined") {
		return {};
	}

	try {
		const stored = localStorage.getItem(STORAGE_KEY);

		if (!stored) {
			return {};
		}

		return JSON.parse(stored) as InsuranceChatHistory;
	} catch {
		return {};
	}
};

const saveToStorage = (history: InsuranceChatHistory): void => {
	if (typeof window === "undefined") {
		return;
	}

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
	} catch {
		return;
	}
};

export const useInsuranceChatHistory = (insuranceCompanyId: string) => {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		const history = loadFromStorage();
		const existingMessages = history[insuranceCompanyId] ?? [];
		setMessages(existingMessages);
		setIsInitialized(true);
	}, [insuranceCompanyId]);

	const addMessage = useCallback(
		(role: "user" | "assistant", content: string) => {
			const newMessage: ChatMessage = {
				id: crypto.randomUUID(),
				role,
				content,
				timestamp: Date.now(),
			};

			setMessages((currentMessages) => {
				const updatedMessages = [...currentMessages, newMessage];

				const history = loadFromStorage();
				const updatedHistory: InsuranceChatHistory = {
					...history,
					[insuranceCompanyId]: updatedMessages,
				};
				saveToStorage(updatedHistory);

				return updatedMessages;
			});

			return newMessage;
		},
		[insuranceCompanyId],
	);

	const clearHistory = useCallback(() => {
		setMessages([]);

		const history = loadFromStorage();
		const { [insuranceCompanyId]: _, ...remainingHistory } = history;
		saveToStorage(remainingHistory);
	}, [insuranceCompanyId]);

	return {
		messages,
		addMessage,
		clearHistory,
		isInitialized,
	};
};
