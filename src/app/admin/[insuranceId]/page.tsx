import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/src/db";
import { insuranceCompaniesTable, policyFilesTable } from "@/src/db/schema";
import { DeleteInsuranceButton } from "./delete-insurance-button";
import { InsuranceEditForm } from "./insurance-edit-form";
import { PolicyFileCard } from "./policy-file-card";
import { RegenerateAISummaryButton } from "./regenerate-ai-summary-button";
import { ReprocessDocumentsButton } from "./reprocess-documents-button";

type AdminInsuranceDetailPageProps = {
	params: Promise<{ insuranceId: string }>;
};

export default async function AdminInsuranceDetailPage({
	params,
}: AdminInsuranceDetailPageProps) {
	const { insuranceId } = await params;

	const insuranceCompanyResults = await db
		.select()
		.from(insuranceCompaniesTable)
		.where(eq(insuranceCompaniesTable.id, insuranceId))
		.limit(1);

	const insuranceCompany = insuranceCompanyResults.at(0);

	if (!insuranceCompany) {
		notFound();
	}

	const policyFiles = await db
		.select()
		.from(policyFilesTable)
		.where(eq(policyFilesTable.insuranceCompanyId, insuranceId));

	const hasNoPolicyFiles = policyFiles.length === 0;

	return (
		<div className="min-h-screen bg-apple-gray-bg">
			<div className="mx-auto max-w-screen-xl px-6 py-16">
				<Link href="/admin">
					<Button
						variant="ghost"
						className="mb-8 text-apple-text-secondary hover:text-apple-text-primary"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Dashboard
					</Button>
				</Link>

				<header className="mb-12">
					<div className="flex items-start justify-between">
						<div>
							<h1 className="font-sans text-4xl font-semibold tracking-tight text-apple-text-primary md:text-5xl">
								{insuranceCompany.companyName}
							</h1>
							{insuranceCompany.insuranceName && (
								<p className="mt-2 text-lg text-apple-text-secondary">
									{insuranceCompany.insuranceName}
								</p>
							)}
						</div>
						<DeleteInsuranceButton
							insuranceId={insuranceCompany.id}
							companyName={insuranceCompany.companyName}
						/>
					</div>
				</header>

				<section className="mb-12">
					<h2 className="mb-6 text-2xl font-semibold text-apple-text-primary">
						Insurance Settings
					</h2>
					<InsuranceEditForm
						insurance={{
							id: insuranceCompany.id,
							companyName: insuranceCompany.companyName,
							insuranceName: insuranceCompany.insuranceName,
							insuranceDescription: insuranceCompany.insuranceDescription,
							coverageDescription: insuranceCompany.coverageDescription,
							generatedSummary: insuranceCompany.generatedSummary,
							topReasons: insuranceCompany.topReasons,
							rightOfWithdrawal: insuranceCompany.rightOfWithdrawal,
							categories: insuranceCompany.categories,
							yearlyPriceInCents: insuranceCompany.yearlyPriceInCents,
							twoYearlyPriceInCents: insuranceCompany.twoYearlyPriceInCents,
							coveragePercentage: insuranceCompany.coveragePercentage,
							deductibleInCents: insuranceCompany.deductibleInCents,
							isActive: insuranceCompany.isActive,
							apiEndpoint: insuranceCompany.apiEndpoint,
						}}
					/>
				</section>

				<section>
					<div className="mb-6 flex items-center justify-between">
						<h2 className="text-2xl font-semibold text-apple-text-primary">
							Policy Documents
						</h2>
					</div>

					{!hasNoPolicyFiles && (
						<div className="mb-4 flex gap-3">
							<RegenerateAISummaryButton insuranceId={insuranceCompany.id} />
							<ReprocessDocumentsButton insuranceId={insuranceCompany.id} />
						</div>
					)}

					{hasNoPolicyFiles ? (
						<Card className="border-apple-card-border bg-apple-card-bg">
							<CardContent className="py-12 text-center">
								<p className="text-apple-text-secondary">
									No policy documents uploaded yet.
								</p>
							</CardContent>
						</Card>
					) : (
						<div className="space-y-4">
							{policyFiles.map((policyFile) => (
								<PolicyFileCard key={policyFile.id} policyFile={policyFile} />
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
