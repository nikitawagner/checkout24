export type ProductCategory =
	| "Smartphone"
	| "Laptop"
	| "Tablet"
	| "Camera"
	| "E-Bike"
	| "Smart Watch"
	| "Smart Home"
	| "Speaker"
	| "Earbuds"
	| "Headphones";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
	"Smartphone",
	"Laptop",
	"Tablet",
	"Camera",
	"E-Bike",
	"Smart Watch",
	"Smart Home",
	"Speaker",
	"Earbuds",
	"Headphones",
];

export type InsurancePlanDuration = "yearly" | "two-yearly";

export type InsuranceRecommendation = {
	insuranceCompanyId: string;
	companyName: string;
	insuranceName: string;
	insuranceDescription: string;
	coverageDescription: string | null;
	generatedSummary: string | null;
	topReasons: string[] | null;
	rightOfWithdrawal: string | null;
	yearlyPriceInCents: number;
	twoYearlyPriceInCents: number;
	coveragePercentage: number;
	deductibleInCents: number;
	valueScore: number;
};

export type InsuranceSummary = {
	insuranceCompanyId: string;
	summary: string;
	highlights: string[];
};

export type ChatMessage = {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: number;
};

export type InsuranceChatHistory = Record<string, ChatMessage[]>;
