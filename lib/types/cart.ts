export type CartItem = {
	productId: string;
	quantity: number;
	hasInsurance: boolean;
	insurancePriceInCents: number | null;
};
