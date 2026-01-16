"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { reprocessPolicyDocuments } from "./actions";

type ReprocessDocumentsButtonProps = {
	insuranceId: string;
};

export function ReprocessDocumentsButton({
	insuranceId,
}: ReprocessDocumentsButtonProps) {
	const [isReprocessing, setIsReprocessing] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const handleReprocess = async () => {
		const confirmed = window.confirm(
			"This will reprocess all policy documents and regenerate embeddings. This may take several minutes. Continue?",
		);

		if (!confirmed) {
			return;
		}

		setIsReprocessing(true);
		setMessage(null);

		try {
			const result = await reprocessPolicyDocuments(insuranceId);

			if (result.success) {
				setMessage({
					type: "success",
					text: "Policy documents reprocessed successfully! Page will reload...",
				});
				setTimeout(() => {
					window.location.reload();
				}, 2000);
			} else {
				setMessage({
					type: "error",
					text: result.error ?? "Failed to reprocess documents",
				});
				setIsReprocessing(false);
			}
		} catch (error) {
			setMessage({
				type: "error",
				text:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
			});
			setIsReprocessing(false);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<Button
				onClick={handleReprocess}
				disabled={isReprocessing}
				variant="outline"
				className="border-apple-card-border bg-apple-card-bg text-apple-text-primary hover:bg-apple-gray-bg"
			>
				{isReprocessing ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Reprocessing...
					</>
				) : (
					<>
						<RefreshCw className="mr-2 h-4 w-4" />
						Reprocess All Documents
					</>
				)}
			</Button>
			{message && (
				<p
					className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
				>
					{message.text}
				</p>
			)}
		</div>
	);
}
