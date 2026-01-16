"use client";

import { Loader2, Send } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useInsuranceChatHistory } from "@/lib/hooks/use-insurance-chat-history";
import { askInsuranceQuestion } from "@/src/actions/insurance";

type InsuranceChatProps = {
	insuranceCompanyId: string;
	insuranceName: string;
};

export function InsuranceChat({
	insuranceCompanyId,
	insuranceName,
}: InsuranceChatProps) {
	const { messages, addMessage, isInitialized } =
		useInsuranceChatHistory(insuranceCompanyId);
	const [inputValue, setInputValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		if (scrollAreaRef.current) {
			const scrollContainer = scrollAreaRef.current.querySelector(
				"[data-radix-scroll-area-viewport]",
			);

			if (scrollContainer) {
				scrollContainer.scrollTop = scrollContainer.scrollHeight;
			}
		}
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		const trimmedInput = inputValue.trim();

		if (!trimmedInput || isLoading) {
			return;
		}

		setInputValue("");
		setIsLoading(true);

		addMessage("user", trimmedInput);
		setTimeout(scrollToBottom, 100);

		const result = await askInsuranceQuestion(
			insuranceCompanyId,
			trimmedInput,
			messages,
		);

		if (result.success) {
			addMessage("assistant", result.data);
		} else {
			addMessage(
				"assistant",
				"Es tut mir leid, aber bei der Verarbeitung Ihrer Frage ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
			);
		}

		setIsLoading(false);
		setTimeout(scrollToBottom, 100);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			handleSubmit(event);
		}
	};

	if (!isInitialized) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin text-apple-text-tertiary" />
			</div>
		);
	}

	return (
		<div className="flex flex-col">
			<div className="mb-3">
				<h4 className="text-sm font-medium text-apple-text-primary">
					Fragen zu {insuranceName}
				</h4>
				<p className="text-xs text-apple-text-tertiary">
					Erhalten Sie sofortige Antworten zu Deckung, Schadensfällen und mehr
				</p>
			</div>

			<ScrollArea
				ref={scrollAreaRef}
				className="h-48 rounded-lg border border-apple-card-border bg-apple-gray-bg p-3"
			>
				{messages.length === 0 ? (
					<div className="flex h-full items-center justify-center">
						<p className="text-center text-sm text-apple-text-tertiary">
							Stellen Sie eine Frage zu Ihrer Versicherungsdeckung.
							<br />
							Zum Beispiel: &quot;Sind Wasserschäden abgedeckt?&quot;
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
										message.role === "user"
											? "bg-teal-500 text-white"
											: "bg-white text-apple-text-primary shadow-sm"
									}`}
								>
									{message.content}
								</div>
							</div>
						))}
						{isLoading && (
							<div className="flex justify-start">
								<div className="rounded-lg bg-white px-3 py-2 shadow-sm">
									<Loader2 className="h-4 w-4 animate-spin text-apple-text-tertiary" />
								</div>
							</div>
						)}
					</div>
				)}
			</ScrollArea>

			<form onSubmit={handleSubmit} className="mt-3 flex gap-2">
				<Textarea
					value={inputValue}
					onChange={(event) => setInputValue(event.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Geben Sie Ihre Frage ein..."
					disabled={isLoading}
					rows={1}
					className="min-h-[40px] flex-1 resize-none border-apple-card-border bg-apple-gray-bg text-apple-text-primary placeholder:text-apple-text-tertiary"
				/>
				<Button
					type="submit"
					disabled={isLoading || !inputValue.trim()}
					size="icon"
					className="h-10 w-10 bg-teal-500 text-white hover:bg-teal-600"
				>
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Send className="h-4 w-4" />
					)}
				</Button>
			</form>
		</div>
	);
}
