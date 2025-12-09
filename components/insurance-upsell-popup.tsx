"use client";

import { Check, Loader2, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type InsuranceUpsellPopupProps = {
	productId: string;
	productName: string;
	isOpen: boolean;
	isInsuranceChecked: boolean;
	monthlyPriceInCents: number | null;
	isLoadingPrice: boolean;
	onClose: () => void;
	onInsuranceChange: (checked: boolean) => void;
	onSeeMore: () => void;
};

const CENTS_PER_DOLLAR = 100;

export function InsuranceUpsellPopup({
	isOpen,
	isInsuranceChecked,
	monthlyPriceInCents,
	isLoadingPrice,
	onClose,
	onInsuranceChange,
	onSeeMore,
}: InsuranceUpsellPopupProps) {
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
						onCheckedChange={(checked) => onInsuranceChange(checked === true)}
						className="mt-0.5"
						disabled={isLoadingPrice || monthlyPriceInCents === null}
					/>
					<div className="flex flex-col gap-1">
						<label
							htmlFor="insurance-checkbox"
							className="cursor-pointer text-sm font-medium text-apple-text-primary"
						>
							{isLoadingPrice ? (
								<span className="flex items-center gap-2">
									<Loader2 className="h-3 w-3 animate-spin" />
									Loading insurance...
								</span>
							) : monthlyPriceInCents !== null ? (
								isInsuranceChecked ? (
									<span className="flex items-center gap-2 text-green-600">
										<Check className="h-4 w-4" />
										Insurance added
									</span>
								) : (
									`Add insurance for $${(monthlyPriceInCents / CENTS_PER_DOLLAR).toFixed(2)}/mo`
								)
							) : (
								"No insurance available"
							)}
						</label>
						{monthlyPriceInCents !== null && (
							<button
								type="button"
								onClick={onSeeMore}
								className="text-left text-sm font-medium text-apple-blue hover:underline"
							>
								See more
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
