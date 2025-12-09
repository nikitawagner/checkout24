"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/context/cart-context";
import type {
	InsuranceRecommendation,
	InsuranceSummary,
} from "@/lib/types/insurance";
import {
	generateInsuranceSummary,
	getRecommendedInsurances,
} from "@/src/actions/insurance";
import {
	InsuranceCard,
	InsuranceChat,
	InsuranceSwitcher,
} from "./insurance-modal/index";

type InsuranceModalProps = {
	isOpen: boolean;
	onClose: () => void;
	productId: string;
	productName: string;
	productCategory: string;
	productPriceInCents: number;
};

export function InsuranceModal({
	isOpen,
	onClose,
	productId,
	productName,
	productCategory,
	productPriceInCents,
}: InsuranceModalProps) {
	const { setInsurance, getInsurancePrice, hasInsurance } = useCart();
	const isInsuranceInCart = hasInsurance(productId);
	const cartInsurancePriceInCents = isInsuranceInCart
		? getInsurancePrice(productId)
		: null;
	const [insurances, setInsurances] = useState<InsuranceRecommendation[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [summaries, setSummaries] = useState<Record<string, InsuranceSummary>>(
		{},
	);
	const [isLoadingRecommendations, setIsLoadingRecommendations] =
		useState(true);
	const [isLoadingSummary, setIsLoadingSummary] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const selectedInsurance = insurances.at(selectedIndex);
	const recommendedInsurance = insurances.at(0);
	const isSelectedRecommended = selectedIndex === 0;
	const selectedSummary = selectedInsurance
		? summaries[selectedInsurance.insuranceCompanyId]
		: null;

	const loadRecommendations = useCallback(async () => {
		setIsLoadingRecommendations(true);
		setError(null);

		const result = await getRecommendedInsurances(
			productCategory,
			productPriceInCents,
		);

		if (result.success) {
			setInsurances(result.data);

			if (result.data.length === 0) {
				setError("No insurance options available for this product category.");
			}
		} else {
			setError("Failed to load insurance recommendations. Please try again.");
		}

		setIsLoadingRecommendations(false);
	}, [productCategory, productPriceInCents]);

	const loadSummary = useCallback(
		async (insurance: InsuranceRecommendation) => {
			if (summaries[insurance.insuranceCompanyId]) {
				return;
			}

			setIsLoadingSummary(true);

			const result = await generateInsuranceSummary(
				insurance.insuranceCompanyId,
				productCategory,
				productName,
			);

			if (result.success) {
				setSummaries((currentSummaries) => ({
					...currentSummaries,
					[insurance.insuranceCompanyId]: result.data,
				}));
			}

			setIsLoadingSummary(false);
		},
		[productCategory, productName, summaries],
	);

	useEffect(() => {
		if (isOpen) {
			loadRecommendations();
		}
	}, [isOpen, loadRecommendations]);

	useEffect(() => {
		if (
			recommendedInsurance &&
			!summaries[recommendedInsurance.insuranceCompanyId]
		) {
			loadSummary(recommendedInsurance);
		}
	}, [recommendedInsurance, summaries, loadSummary]);

	const handleSelectInsurance = (index: number) => {
		setSelectedIndex(index);
	};

	const handleAddInsurance = () => {
		setInsurance(
			productId,
			true,
			selectedInsurance?.monthlyPriceInCents ?? null,
		);
		onClose();
	};

	const handleClose = () => {
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold text-apple-text-primary">
						Insurance Options
					</DialogTitle>
					<DialogDescription className="text-apple-text-secondary">
						Protect your {productName} with our coverage plans
					</DialogDescription>
				</DialogHeader>

				{isLoadingRecommendations ? (
					<div className="flex h-64 items-center justify-center">
						<div className="text-center">
							<Loader2 className="mx-auto h-8 w-8 animate-spin text-apple-blue" />
							<p className="mt-3 text-sm text-apple-text-secondary">
								Finding the best insurance for you...
							</p>
						</div>
					</div>
				) : error ? (
					<div className="flex h-64 items-center justify-center">
						<div className="text-center">
							<p className="text-sm text-apple-text-secondary">{error}</p>
							<Button
								variant="outline"
								onClick={loadRecommendations}
								className="mt-4"
							>
								Try Again
							</Button>
						</div>
					</div>
				) : selectedInsurance ? (
					<div className="space-y-4">
						<InsuranceSwitcher
							insurances={insurances}
							selectedIndex={selectedIndex}
							onSelect={handleSelectInsurance}
							cartInsurancePriceInCents={cartInsurancePriceInCents}
						/>

						<InsuranceCard
							insurance={selectedInsurance}
							summary={selectedSummary}
							isLoadingSummary={isLoadingSummary}
							isRecommended={isSelectedRecommended}
						/>

						<Separator />

						<InsuranceChat
							insuranceCompanyId={selectedInsurance.insuranceCompanyId}
							insuranceName={selectedInsurance.insuranceName}
						/>
					</div>
				) : null}

				<DialogFooter className="gap-2 sm:gap-0">
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button
						onClick={handleAddInsurance}
						disabled={!selectedInsurance}
						className="bg-apple-blue text-white hover:bg-apple-blue/90"
					>
						Add Insurance
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
