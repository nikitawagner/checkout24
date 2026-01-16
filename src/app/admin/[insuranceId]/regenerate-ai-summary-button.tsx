"use client";

import { CheckCircle, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { regenerateInsuranceSummary } from "./actions";

type RegenerateAISummaryButtonProps = {
	insuranceId: string;
};

export function RegenerateAISummaryButton({
	insuranceId,
}: RegenerateAISummaryButtonProps) {
	const router = useRouter();
	const [isRegenerating, setIsRegenerating] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleRegenerate = async () => {
		setIsRegenerating(true);
		setErrorMessage(null);
		setShowSuccess(false);

		const result = await regenerateInsuranceSummary(insuranceId);

		setIsRegenerating(false);

		if (result.success) {
			setShowSuccess(true);
			router.refresh();
			setTimeout(() => setShowSuccess(false), 3_000);
		} else {
			setErrorMessage(result.error ?? "Failed to regenerate AI summary");
		}
	};

	return (
		<div className="space-y-3">
			<Button
				onClick={handleRegenerate}
				disabled={isRegenerating}
				variant="outline"
				className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
			>
				{isRegenerating ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Regenerating AI Summary...
					</>
				) : (
					<>
						<Sparkles className="mr-2 h-4 w-4" />
						Regenerate AI Summary from Policies
					</>
				)}
			</Button>

			{showSuccess && (
				<div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
					<CheckCircle className="h-4 w-4 text-green-600" />
					<p className="text-sm text-green-800">
						AI summary regenerated successfully!
					</p>
				</div>
			)}

			{errorMessage && (
				<div className="rounded-lg border border-red-200 bg-red-50 p-3">
					<p className="text-sm text-red-800">{errorMessage}</p>
				</div>
			)}
		</div>
	);
}
