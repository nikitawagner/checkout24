"use client";

import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	PRODUCT_CATEGORIES,
	type ProductCategory,
} from "@/lib/types/insurance";
import { updateInsuranceCompany } from "./actions";

type InsuranceData = {
	id: string;
	companyName: string;
	insuranceName: string | null;
	insuranceDescription: string | null;
	categories: string[] | null;
	monthlyPriceInCents: number | null;
	coveragePercentage: number | null;
	deductibleInCents: number | null;
	isActive: number;
	apiEndpoint: string;
};

type InsuranceEditFormProps = {
	insurance: InsuranceData;
};

type FormStatus = "idle" | "loading" | "success" | "error";

const CENTS_PER_DOLLAR = 100;

export function InsuranceEditForm({ insurance }: InsuranceEditFormProps) {
	const [companyName, setCompanyName] = useState(insurance.companyName);
	const [insuranceName, setInsuranceName] = useState(
		insurance.insuranceName ?? "",
	);
	const [insuranceDescription, setInsuranceDescription] = useState(
		insurance.insuranceDescription ?? "",
	);
	const [selectedCategories, setSelectedCategories] = useState<
		ProductCategory[]
	>((insurance.categories as ProductCategory[]) ?? []);
	const [monthlyPriceDollars, setMonthlyPriceDollars] = useState(
		insurance.monthlyPriceInCents
			? (insurance.monthlyPriceInCents / CENTS_PER_DOLLAR).toString()
			: "",
	);
	const [coveragePercentage, setCoveragePercentage] = useState(
		insurance.coveragePercentage?.toString() ?? "",
	);
	const [deductibleDollars, setDeductibleDollars] = useState(
		insurance.deductibleInCents
			? (insurance.deductibleInCents / CENTS_PER_DOLLAR).toString()
			: "",
	);
	const [isActive, setIsActive] = useState(insurance.isActive === 1);
	const [apiEndpoint, setApiEndpoint] = useState(insurance.apiEndpoint);
	const [formStatus, setFormStatus] = useState<FormStatus>("idle");
	const [errorMessage, setErrorMessage] = useState("");

	const handleCategoryToggle = (category: ProductCategory) => {
		const isCurrentlySelected = selectedCategories.includes(category);
		const updatedCategories = isCurrentlySelected
			? selectedCategories.filter(
					(selectedCategory) => selectedCategory !== category,
				)
			: [...selectedCategories, category];
		setSelectedCategories(updatedCategories);
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setFormStatus("loading");
		setErrorMessage("");

		const monthlyPriceInCents = Math.round(
			Number.parseFloat(monthlyPriceDollars || "0") * CENTS_PER_DOLLAR,
		);
		const deductibleInCents = Math.round(
			Number.parseFloat(deductibleDollars || "0") * CENTS_PER_DOLLAR,
		);
		const coveragePercentageValue = Number.parseInt(
			coveragePercentage || "0",
			10,
		);

		const result = await updateInsuranceCompany(insurance.id, {
			companyName,
			insuranceName,
			insuranceDescription,
			categories: selectedCategories,
			monthlyPriceInCents,
			coveragePercentage: coveragePercentageValue,
			deductibleInCents,
			isActive: isActive ? 1 : 0,
			apiEndpoint,
		});

		if (result.success) {
			setFormStatus("success");
			setTimeout(() => setFormStatus("idle"), 3000);
		} else {
			setFormStatus("error");
			setErrorMessage(result.error ?? "An unexpected error occurred");
		}
	};

	const isFormDisabled = formStatus === "loading";

	return (
		<Card className="border-apple-card-border bg-apple-card-bg p-8">
			{formStatus === "success" && (
				<div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
					<CheckCircle className="h-5 w-5 text-green-600" />
					<p className="text-green-800">
						Insurance settings updated successfully!
					</p>
				</div>
			)}

			{formStatus === "error" && (
				<div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
					<p className="text-red-800">{errorMessage}</p>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-8">
				<div className="space-y-2">
					<Label htmlFor="companyName" className="text-apple-text-primary">
						Company Name
					</Label>
					<Input
						id="companyName"
						type="text"
						placeholder="Enter your company name"
						value={companyName}
						onChange={(event) => setCompanyName(event.target.value)}
						disabled={isFormDisabled}
						required
						className="border-apple-card-border bg-apple-gray-bg text-apple-text-primary placeholder:text-apple-text-tertiary"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="insuranceName" className="text-apple-text-primary">
						Insurance Name
					</Label>
					<Input
						id="insuranceName"
						type="text"
						placeholder="e.g., Premium Device Protection"
						value={insuranceName}
						onChange={(event) => setInsuranceName(event.target.value)}
						disabled={isFormDisabled}
						className="border-apple-card-border bg-apple-gray-bg text-apple-text-primary placeholder:text-apple-text-tertiary"
					/>
				</div>

				<div className="space-y-2">
					<Label
						htmlFor="insuranceDescription"
						className="text-apple-text-primary"
					>
						Insurance Description
					</Label>
					<Textarea
						id="insuranceDescription"
						placeholder="Describe your insurance coverage and benefits..."
						value={insuranceDescription}
						onChange={(event) => setInsuranceDescription(event.target.value)}
						disabled={isFormDisabled}
						rows={4}
						className="border-apple-card-border bg-apple-gray-bg text-apple-text-primary placeholder:text-apple-text-tertiary"
					/>
				</div>

				<div className="space-y-3">
					<Label className="text-apple-text-primary">
						Supported Product Categories
					</Label>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						{PRODUCT_CATEGORIES.map((category) => (
							<label
								key={category}
								htmlFor={`category-${category}`}
								className="flex cursor-pointer items-center gap-2 rounded-lg border border-apple-card-border bg-apple-gray-bg p-3 transition-colors hover:bg-apple-gray-bg/80"
							>
								<Checkbox
									id={`category-${category}`}
									checked={selectedCategories.includes(category)}
									onCheckedChange={() => handleCategoryToggle(category)}
									disabled={isFormDisabled}
								/>
								<span className="text-sm text-apple-text-primary">
									{category}
								</span>
							</label>
						))}
					</div>
					<p className="text-sm text-apple-text-tertiary">
						Select all product categories your insurance covers.
					</p>
				</div>

				<div className="grid gap-6 sm:grid-cols-3">
					<div className="space-y-2">
						<Label htmlFor="monthlyPrice" className="text-apple-text-primary">
							Monthly Price ($)
						</Label>
						<Input
							id="monthlyPrice"
							type="number"
							step="0.01"
							min="0"
							placeholder="3.99"
							value={monthlyPriceDollars}
							onChange={(event) => setMonthlyPriceDollars(event.target.value)}
							disabled={isFormDisabled}
							className="border-apple-card-border bg-apple-gray-bg text-apple-text-primary placeholder:text-apple-text-tertiary"
						/>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="coveragePercentage"
							className="text-apple-text-primary"
						>
							Coverage (%)
						</Label>
						<Input
							id="coveragePercentage"
							type="number"
							min="0"
							max="100"
							placeholder="80"
							value={coveragePercentage}
							onChange={(event) => setCoveragePercentage(event.target.value)}
							disabled={isFormDisabled}
							className="border-apple-card-border bg-apple-gray-bg text-apple-text-primary placeholder:text-apple-text-tertiary"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="deductible" className="text-apple-text-primary">
							Deductible ($)
						</Label>
						<Input
							id="deductible"
							type="number"
							step="0.01"
							min="0"
							placeholder="50.00"
							value={deductibleDollars}
							onChange={(event) => setDeductibleDollars(event.target.value)}
							disabled={isFormDisabled}
							className="border-apple-card-border bg-apple-gray-bg text-apple-text-primary placeholder:text-apple-text-tertiary"
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="apiEndpoint" className="text-apple-text-primary">
						Contract API Endpoint
					</Label>
					<Input
						id="apiEndpoint"
						type="url"
						placeholder="https://api.your-insurance.com/contracts"
						value={apiEndpoint}
						onChange={(event) => setApiEndpoint(event.target.value)}
						disabled={isFormDisabled}
						required
						className="border-apple-card-border bg-apple-gray-bg text-apple-text-primary placeholder:text-apple-text-tertiary"
					/>
					<p className="text-sm text-apple-text-tertiary">
						The endpoint where our platform will send contract CRUD operations.
					</p>
				</div>

				<label
					htmlFor="isActive"
					className="flex cursor-pointer items-center gap-3 rounded-lg border border-apple-card-border bg-apple-gray-bg p-4"
				>
					<Checkbox
						id="isActive"
						checked={isActive}
						onCheckedChange={(checked) => setIsActive(checked === true)}
						disabled={isFormDisabled}
					/>
					<div>
						<span className="font-medium text-apple-text-primary">
							Active Insurance
						</span>
						<p className="text-sm text-apple-text-tertiary">
							When active, this insurance will be available for product
							recommendations.
						</p>
					</div>
				</label>

				<Button
					type="submit"
					disabled={isFormDisabled}
					className="w-full bg-apple-blue text-white hover:bg-apple-blue/90"
				>
					{formStatus === "loading" ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Saving...
						</>
					) : (
						"Save Changes"
					)}
				</Button>
			</form>
		</Card>
	);
}
