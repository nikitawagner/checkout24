"use client";

import type { ReactNode } from "react";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import type { CartItem } from "@/lib/types/cart";
import type { InsurancePlanDuration } from "@/lib/types/insurance";

type CartContextType = {
	items: CartItem[];
	addItem: (productId: string) => void;
	removeItem: (productId: string) => void;
	getItemQuantity: (productId: string) => number;
	getTotalItems: () => number;
	clearCart: () => void;
	setInsurance: (
		productId: string,
		hasInsurance: boolean,
		priceInCents?: number | null,
		planDuration?: InsurancePlanDuration | null,
	) => void;
	hasInsurance: (productId: string) => boolean;
	getInsurancePrice: (productId: string) => number | null;
	getInsurancePlanDuration: (productId: string) => InsurancePlanDuration | null;
};

const CartContext = createContext<CartContextType | null>(null);

type CartProviderProps = {
	children: ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
	const [items, setItems] = useState<CartItem[]>([]);

	const addItem = useCallback((productId: string) => {
		setItems((currentItems) => {
			const existingItem = currentItems.find(
				(item) => item.productId === productId,
			);

			if (existingItem) {
				return currentItems.map((item) =>
					item.productId === productId
						? { ...item, quantity: item.quantity + 1 }
						: item,
				);
			}

			return [
				...currentItems,
				{
					productId,
					quantity: 1,
					hasInsurance: false,
					insurancePriceInCents: null,
					insurancePlanDuration: null,
				},
			];
		});
	}, []);

	const removeItem = useCallback((productId: string) => {
		setItems((currentItems) => {
			const existingItem = currentItems.find(
				(item) => item.productId === productId,
			);

			if (!existingItem) {
				return currentItems;
			}

			if (existingItem.quantity === 1) {
				return currentItems.filter((item) => item.productId !== productId);
			}

			return currentItems.map((item) =>
				item.productId === productId
					? { ...item, quantity: item.quantity - 1 }
					: item,
			);
		});
	}, []);

	const getItemQuantity = useCallback(
		(productId: string) => {
			const item = items.find((cartItem) => cartItem.productId === productId);

			return item?.quantity ?? 0;
		},
		[items],
	);

	const getTotalItems = useCallback(() => {
		return items.reduce((total, item) => total + item.quantity, 0);
	}, [items]);

	const clearCart = useCallback(() => {
		setItems([]);
	}, []);

	const setInsurance = useCallback(
		(
			productId: string,
			insuranceEnabled: boolean,
			priceInCents?: number | null,
			planDuration?: InsurancePlanDuration | null,
		) => {
			setItems((currentItems) =>
				currentItems.map((item) =>
					item.productId === productId
						? {
								...item,
								hasInsurance: insuranceEnabled,
								insurancePriceInCents:
									priceInCents !== undefined
										? priceInCents
										: item.insurancePriceInCents,
								insurancePlanDuration:
									planDuration !== undefined
										? planDuration
										: item.insurancePlanDuration,
							}
						: item,
				),
			);
		},
		[],
	);

	const hasInsuranceForProduct = useCallback(
		(productId: string) => {
			const item = items.find((cartItem) => cartItem.productId === productId);

			return item?.hasInsurance ?? false;
		},
		[items],
	);

	const getInsurancePrice = useCallback(
		(productId: string) => {
			const item = items.find((cartItem) => cartItem.productId === productId);

			return item?.insurancePriceInCents ?? null;
		},
		[items],
	);

	const getInsurancePlanDuration = useCallback(
		(productId: string) => {
			const item = items.find((cartItem) => cartItem.productId === productId);

			return item?.insurancePlanDuration ?? null;
		},
		[items],
	);

	const contextValue = useMemo(
		() => ({
			items,
			addItem,
			removeItem,
			getItemQuantity,
			getTotalItems,
			clearCart,
			setInsurance,
			hasInsurance: hasInsuranceForProduct,
			getInsurancePrice,
			getInsurancePlanDuration,
		}),
		[
			items,
			addItem,
			removeItem,
			getItemQuantity,
			getTotalItems,
			clearCart,
			setInsurance,
			hasInsuranceForProduct,
			getInsurancePrice,
			getInsurancePlanDuration,
		],
	);

	return (
		<CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);

	if (!context) {
		throw new Error("useCart must be used within a CartProvider");
	}

	return context;
}
