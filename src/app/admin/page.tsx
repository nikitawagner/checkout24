import { eq, sql } from "drizzle-orm";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { db } from "@/src/db";
import { insuranceCompaniesTable, policyFilesTable } from "@/src/db/schema";

const CENTS_PER_DOLLAR = 100;
const MAX_VISIBLE_CATEGORIES = 2;

export default async function AdminPage() {
	const insuranceCompaniesWithCounts = await db
		.select({
			id: insuranceCompaniesTable.id,
			companyName: insuranceCompaniesTable.companyName,
			insuranceName: insuranceCompaniesTable.insuranceName,
			categories: insuranceCompaniesTable.categories,
			monthlyPriceInCents: insuranceCompaniesTable.monthlyPriceInCents,
			isActive: insuranceCompaniesTable.isActive,
			apiEndpoint: insuranceCompaniesTable.apiEndpoint,
			createdAt: insuranceCompaniesTable.createdAt,
			policyFilesCount: sql<number>`count(${policyFilesTable.id})`.as(
				"policy_files_count",
			),
		})
		.from(insuranceCompaniesTable)
		.leftJoin(
			policyFilesTable,
			eq(insuranceCompaniesTable.id, policyFilesTable.insuranceCompanyId),
		)
		.groupBy(insuranceCompaniesTable.id);

	const hasNoCompanies = insuranceCompaniesWithCounts.length === 0;

	return (
		<div className="min-h-screen bg-apple-gray-bg">
			<div className="mx-auto max-w-screen-xl px-6 py-16">
				<header className="mb-12 text-center">
					<h1 className="font-sans text-4xl font-semibold tracking-tight text-apple-text-primary md:text-5xl">
						Admin Dashboard
					</h1>
					<p className="mt-4 text-lg text-apple-text-secondary">
						Manage insurance companies and their policy documents.
					</p>
				</header>

				{hasNoCompanies ? (
					<div className="py-16 text-center">
						<p className="text-lg text-apple-text-secondary">
							No insurance companies registered yet.
						</p>
					</div>
				) : (
					<section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{insuranceCompaniesWithCounts.map((company) => {
							const categories = company.categories ?? [];
							const visibleCategories = categories.slice(
								0,
								MAX_VISIBLE_CATEGORIES,
							);
							const remainingCategoriesCount =
								categories.length - MAX_VISIBLE_CATEGORIES;
							const monthlyPriceInDollars = company.monthlyPriceInCents
								? (company.monthlyPriceInCents / CENTS_PER_DOLLAR).toFixed(2)
								: null;
							const isActive = company.isActive === 1;

							return (
								<Link key={company.id} href={`/admin/${company.id}`}>
									<Card className="cursor-pointer border-apple-card-border bg-apple-card-bg transition-shadow hover:shadow-lg">
										<CardHeader>
											<div className="flex items-start justify-between">
												<div>
													<CardTitle className="text-apple-text-primary">
														{company.companyName}
													</CardTitle>
													<CardDescription className="mt-1 text-apple-text-secondary">
														{company.insuranceName ?? "No insurance name set"}
													</CardDescription>
												</div>
												<Badge
													variant={isActive ? "default" : "secondary"}
													className={
														isActive
															? "bg-green-100 text-green-800"
															: "bg-gray-100 text-gray-600"
													}
												>
													{isActive ? "Active" : "Inactive"}
												</Badge>
											</div>
										</CardHeader>
										<CardContent className="space-y-3">
											{categories.length > 0 && (
												<div className="flex flex-wrap gap-1">
													{visibleCategories.map((category) => (
														<Badge
															key={category}
															variant="outline"
															className="text-xs"
														>
															{category}
														</Badge>
													))}
													{remainingCategoriesCount > 0 && (
														<Badge variant="outline" className="text-xs">
															+{remainingCategoriesCount} more
														</Badge>
													)}
												</div>
											)}

											<div className="flex items-center justify-between text-sm">
												{monthlyPriceInDollars && (
													<span className="font-medium text-apple-text-primary">
														${monthlyPriceInDollars}/mo
													</span>
												)}
												<span className="text-apple-text-tertiary">
													{company.policyFilesCount} policy file
													{company.policyFilesCount !== 1 ? "s" : ""}
												</span>
											</div>
										</CardContent>
									</Card>
								</Link>
							);
						})}
					</section>
				)}
			</div>
		</div>
	);
}
