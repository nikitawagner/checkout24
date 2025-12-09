"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ClickSpark from "@/components/ClickSpark";
import { InsuranceModal } from "@/components/insurance-modal";
import { InsuranceUpsellPopup } from "@/components/insurance-upsell-popup";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/context/cart-context";
import type { InsuranceRecommendation } from "@/lib/types/insurance";
import { getRecommendedInsurances } from "@/src/actions/insurance";

type AddToCartButtonProps = {
	productId: string;
	productName: string;
	productCategory: string;
	productPriceInCents: number;
};

export function AddToCartButton({
	productId,
	productName,
	productCategory,
	productPriceInCents,
}: AddToCartButtonProps) {
	const { addItem, getItemQuantity, setInsurance, hasInsurance } = useCart();
	const quantity = getItemQuantity(productId);
	const isInCart = quantity > 0;
	const isInsuranceAdded = hasInsurance(productId);

	const [isInsurancePopupOpen, setIsInsurancePopupOpen] = useState(false);
	const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
	const [recommendedInsurance, setRecommendedInsurance] =
		useState<InsuranceRecommendation | null>(null);
	const [isLoadingInsurance, setIsLoadingInsurance] = useState(true);

	const loadRecommendedInsurance = useCallback(async () => {
		setIsLoadingInsurance(true);

		const result = await getRecommendedInsurances(
			productCategory,
			productPriceInCents,
		);

		if (result.success && result.data.length > 0) {
			setRecommendedInsurance(result.data.at(0) ?? null);
		}

		setIsLoadingInsurance(false);
	}, [productCategory, productPriceInCents]);

	useEffect(() => {
		loadRecommendedInsurance();
	}, [loadRecommendedInsurance]);

	const handleAddToBag = () => {
		addItem(productId);
		setIsInsurancePopupOpen(true);
	};

	const handleInsuranceChange = (checked: boolean) => {
		setInsurance(
			productId,
			checked,
			recommendedInsurance?.monthlyPriceInCents ?? null,
		);
	};

	const handleSeeMore = () => {
		setIsInsuranceModalOpen(true);
	};

	const handleModalClose = () => {
		setIsInsuranceModalOpen(false);
	};

	if (!isInCart) {
		return (
			<div className="flex flex-col">
				<ClickSpark
					sparkColor="#0071e3"
					sparkCount={8}
					sparkRadius={20}
					duration={400}
				>
					<Button
						size="lg"
						onClick={handleAddToBag}
						className="h-14 w-full rounded-xl bg-apple-blue text-lg font-medium text-white transition-all duration-300 hover:bg-apple-blue/90 active:scale-[0.98]"
					>
						<ShoppingBag className="size-5" />
						Add to Bag
					</Button>
				</ClickSpark>

				<InsuranceModal
					isOpen={isInsuranceModalOpen}
					onClose={handleModalClose}
					productId={productId}
					productName={productName}
					productCategory={productCategory}
					productPriceInCents={productPriceInCents}
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<Button
				size="lg"
				disabled
				className="h-14 w-full cursor-default rounded-xl bg-green-600 text-lg font-medium text-white opacity-100 hover:bg-green-600"
			>
				<Check className="size-5" />
				In Bag
			</Button>

			<InsuranceUpsellPopup
				productId={productId}
				productName={productName}
				isOpen={isInsurancePopupOpen}
				isInsuranceChecked={isInsuranceAdded}
				monthlyPriceInCents={recommendedInsurance?.monthlyPriceInCents ?? null}
				isLoadingPrice={isLoadingInsurance}
				onClose={() => setIsInsurancePopupOpen(false)}
				onInsuranceChange={handleInsuranceChange}
				onSeeMore={handleSeeMore}
			/>

			<InsuranceModal
				isOpen={isInsuranceModalOpen}
				onClose={handleModalClose}
				productId={productId}
				productName={productName}
				productCategory={productCategory}
				productPriceInCents={productPriceInCents}
			/>
		</div>
	);
}
