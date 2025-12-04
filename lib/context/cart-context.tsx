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

type CartContextType = {
	items: CartItem[];
	addItem: (productId: string) => void;
	removeItem: (productId: string) => void;
	getItemQuantity: (productId: string) => number;
	getTotalItems: () => number;
	clearCart: () => void;
	setInsurance: (productId: string, hasInsurance: boolean) => void;
	hasInsurance: (productId: string) => boolean;
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

			return [...currentItems, { productId, quantity: 1, hasInsurance: false }];
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
		(productId: string, insuranceEnabled: boolean) => {
			setItems((currentItems) =>
				currentItems.map((item) =>
					item.productId === productId
						? { ...item, hasInsurance: insuranceEnabled }
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
