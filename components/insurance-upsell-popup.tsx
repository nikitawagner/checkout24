"use client";

import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type InsuranceUpsellPopupProps = {
	productId: string;
	productName: string;
	isOpen: boolean;
	isInsuranceChecked: boolean;
	onClose: () => void;
	onInsuranceChange: (checked: boolean) => void;
	onSeeMore: () => void;
};

const INSURANCE_PRICE = 3.99;

export function InsuranceUpsellPopup({
	isOpen,
	isInsuranceChecked,
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
					/>
					<div className="flex flex-col gap-1">
						<label
							htmlFor="insurance-checkbox"
							className="cursor-pointer text-sm font-medium text-apple-text-primary"
						>
							Add insurance for ${INSURANCE_PRICE.toFixed(2)}
						</label>
						<button
							type="button"
							onClick={onSeeMore}
							className="text-left text-sm font-medium text-apple-blue hover:underline"
						>
							See more
						</button>
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
