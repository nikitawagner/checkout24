import type { InsurancePlanDuration } from "./insurance";

export type CartItem = {
	productId: string;
	quantity: number;
	hasInsurance: boolean;
	insurancePriceInCents: number | null;
	insurancePlanDuration: InsurancePlanDuration | null;
};
