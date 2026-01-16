"use client";

import { Check, Loader2, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type InsuranceUpsellPopupProps = {
	productId: string;
	productName: string;
	isOpen: boolean;
	isInsuranceChecked: boolean;
	yearlyPriceInCents: number | null;
	twoYearlyPriceInCents: number | null;
	isLoadingPrice: boolean;
	onClose: () => void;
	onOpenModal: () => void;
};

export function InsuranceUpsellPopup({
	isOpen,
	isInsuranceChecked,
	yearlyPriceInCents,
	twoYearlyPriceInCents,
	isLoadingPrice,
	onClose,
	onOpenModal,
}: InsuranceUpsellPopupProps) {
	// Default to 2 years (two-yearly)
	const defaultPriceInCents = twoYearlyPriceInCents ?? yearlyPriceInCents;
	const defaultDuration = twoYearlyPriceInCents !== null ? "2 Jahre" : "1 Jahr";
	if (!isOpen) {
		return null;
	}

	return (
		<div className="animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-border bg-apple-card-bg p-4 shadow-lg duration-300">
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-start gap-3">
					<Checkbox
						id="insurance-checkbox"
						checked={isInsuranceChecked}
						onCheckedChange={() => onOpenModal()}
						className="mt-0.5"
						disabled={isLoadingPrice || defaultPriceInCents === null}
					/>
					<div className="flex flex-col gap-1">
						<label
							htmlFor="insurance-checkbox"
							className="cursor-pointer text-sm font-medium text-apple-text-primary"
							onClick={() =>
								!isLoadingPrice && defaultPriceInCents !== null && onOpenModal()
							}
							onKeyDown={(e) => {
								if (
									(e.key === "Enter" || e.key === " ") &&
									!isLoadingPrice &&
									defaultPriceInCents !== null
								) {
									e.preventDefault();
									onOpenModal();
								}
							}}
						>
							{isLoadingPrice ? (
								<span className="flex items-center gap-2">
									<Loader2 className="h-3 w-3 animate-spin" />
									Versicherung wird geladen...
								</span>
							) : defaultPriceInCents !== null ? (
								isInsuranceChecked ? (
									<span className="flex items-center gap-2 text-green-600">
										<Check className="h-4 w-4" />
										Versicherung hinzugefügt
									</span>
								) : (
									`${defaultDuration} Schutz hinzufügen für ${(defaultPriceInCents / 100).toFixed(2).replace(".", ",")} €`
								)
							) : (
								"Keine Versicherung verfügbar"
							)}
						</label>
						{defaultPriceInCents !== null && (
							<button
								type="button"
								onClick={onOpenModal}
								className="text-left text-sm font-medium text-apple-blue hover:underline"
							>
								Mehr erfahren
							</button>
						)}
					</div>
				</div>

				<button
					type="button"
					onClick={onClose}
					className="flex size-6 items-center justify-center rounded-full text-apple-text-secondary transition-colors hover:bg-apple-blue/10 hover:text-apple-text-primary"
				>
					<X className="size-4" />
				</button>
			</div>
		</div>
	);
}
