"use client";

import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type {
	InsuranceRecommendation,
	InsuranceSummary,
} from "@/lib/types/insurance";

type InsuranceCardProps = {
	insurance: InsuranceRecommendation;
	summary: InsuranceSummary | null;
	isLoadingSummary: boolean;
	isRecommended: boolean;
};

const CENTS_PER_DOLLAR = 100;

const formatCurrency = (cents: number): string => {
	const dollars = cents / CENTS_PER_DOLLAR;

	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(dollars);
};

export function InsuranceCard({
	insurance,
	summary,
	isLoadingSummary,
	isRecommended,
}: InsuranceCardProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-start justify-between">
				<div>
					<h3 className="text-lg font-semibold text-apple-text-primary">
						{insurance.insuranceName}
					</h3>
					<p className="text-sm text-apple-text-secondary">
						by {insurance.companyName}
					</p>
				</div>
				<div className="text-right">
					<p className="text-2xl font-bold text-apple-blue">
						{formatCurrency(insurance.monthlyPriceInCents)}
					</p>
					<p className="text-xs text-apple-text-tertiary">per month</p>
				</div>
			</div>

			<div className="flex flex-wrap gap-2">
				<Badge variant="secondary" className="bg-green-100 text-green-800">
					{insurance.coveragePercentage}% Coverage
				</Badge>
				<Badge variant="secondary" className="bg-orange-100 text-orange-800">
					{formatCurrency(insurance.deductibleInCents)} Deductible
				</Badge>
			</div>

			<p className="text-sm text-apple-text-secondary">
				{insurance.insuranceDescription}
			</p>

			<div
				className="grid transition-[grid-template-rows] duration-300 ease-in-out"
				style={{
					gridTemplateRows: isRecommended ? "1fr" : "0fr",
				}}
			>
				<div className="overflow-hidden">
					<div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
						<div className="mb-2 flex items-center gap-2">
							<Sparkles className="h-4 w-4 text-purple-600" />
							<span className="text-sm font-medium text-purple-800">
								Why this insurance?
							</span>
						</div>

						{isLoadingSummary ? (
							<div className="space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="mt-3 h-3 w-1/2" />
								<Skeleton className="h-3 w-2/3" />
								<Skeleton className="h-3 w-1/2" />
							</div>
						) : summary ? (
							<div className="space-y-3">
								<p className="text-sm text-purple-900">{summary.summary}</p>
								{summary.highlights.length > 0 && (
									<ul className="space-y-1">
										{summary.highlights.map((highlight, index) => (
											<li
												key={`highlight-${insurance.insuranceCompanyId}-${index}`}
												className="flex items-start gap-2 text-sm text-purple-800"
											>
												<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-600" />
												{highlight}
											</li>
										))}
									</ul>
								)}
							</div>
						) : (
							<p className="text-sm text-purple-700">
								Loading personalized recommendation...
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
