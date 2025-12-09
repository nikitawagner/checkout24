"use client";

import { Check, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InsuranceRecommendation } from "@/lib/types/insurance";

type InsuranceSwitcherProps = {
	insurances: InsuranceRecommendation[];
	selectedIndex: number;
	onSelect: (index: number) => void;
	cartInsurancePriceInCents: number | null;
};

const CENTS_PER_DOLLAR = 100;

const formatCurrency = (cents: number): string => {
	const dollars = cents / CENTS_PER_DOLLAR;

	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(dollars);
};

export function InsuranceSwitcher({
	insurances,
	selectedIndex,
	onSelect,
	cartInsurancePriceInCents,
}: InsuranceSwitcherProps) {
	if (insurances.length <= 1) {
		return null;
	}

	return (
		<Tabs
			value={String(selectedIndex)}
			onValueChange={(value) => onSelect(Number.parseInt(value, 10))}
			className="w-full"
		>
			<TabsList className="grid h-auto w-full auto-cols-fr grid-flow-col gap-1 p-1">
				{insurances.map((insurance, index) => {
					const isRecommended = index === 0;
					const isInCart =
						cartInsurancePriceInCents !== null &&
						insurance.monthlyPriceInCents === cartInsurancePriceInCents;

					return (
						<TabsTrigger
							key={insurance.insuranceCompanyId}
							value={String(index)}
							className="relative flex flex-col gap-1 px-2 py-3"
						>
							{isInCart ? (
								<Badge className="absolute -top-1 left-1/2 -translate-x-1/2 bg-green-500 px-1.5 py-0 text-[10px] font-medium text-white hover:bg-green-500">
									<Check className="mr-0.5 h-2.5 w-2.5" />
									In Cart
								</Badge>
							) : isRecommended ? (
								<Badge className="absolute -top-1 left-1/2 -translate-x-1/2 bg-amber-500 px-1.5 py-0 text-[10px] font-medium text-white hover:bg-amber-500">
									<Star className="mr-0.5 h-2.5 w-2.5" />
									Best
								</Badge>
							) : null}
							<span className="mt-1 truncate text-xs font-medium">
								{insurance.companyName}
							</span>
							<span className="text-xs text-muted-foreground">
								{formatCurrency(insurance.monthlyPriceInCents)}/mo
							</span>
						</TabsTrigger>
					);
				})}
			</TabsList>
		</Tabs>
	);
}
