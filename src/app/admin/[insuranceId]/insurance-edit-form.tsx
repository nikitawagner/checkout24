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
	coverageDescription: string | null;
	generatedSummary: string | null;
	topReasons: string[] | null;
	rightOfWithdrawal: string | null;
	categories: string[] | null;
	yearlyPriceInCents: number | null;
	twoYearlyPriceInCents: number | null;
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
	const [coverageDescription, setCoverageDescription] = useState(
		insurance.coverageDescription ?? "",
	);
	const [rightOfWithdrawal, setRightOfWithdrawal] = useState(
		insurance.rightOfWithdrawal ?? "",
	);
	const [selectedCategories, setSelectedCategories] = useState<
		ProductCategory[]
	>((insurance.categories as ProductCategory[]) ?? []);
	const [yearlyPriceDollars, setYearlyPriceDollars] = useState(
		insurance.yearlyPriceInCents
			? (insurance.yearlyPriceInCents / CENTS_PER_DOLLAR).toString()
			: "",
	);
	const [twoYearlyPriceDollars, setTwoYearlyPriceDollars] = useState(
		insurance.twoYearlyPriceInCents
			? (insurance.twoYearlyPriceInCents / CENTS_PER_DOLLAR).toString()
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

		const yearlyPriceInCents = Math.round(
			Number.parseFloat(yearlyPriceDollars || "0") * CENTS_PER_DOLLAR,
		);
		const twoYearlyPriceInCents = Math.round(
			Number.parseFloat(twoYearlyPriceDollars || "0") * CENTS_PER_DOLLAR,
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
			coverageDescription: coverageDescription || undefined,
			rightOfWithdrawal: rightOfWithdrawal || undefined,
			categories: selectedCategories,
			yearlyPriceInCents,
			twoYearlyPriceInCents,
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
			setErrorMessage(
				result.error ?? "Ein unerwarteter Fehler ist aufgetreten",
			);
		}
	};

	const isFormDisabled = formStatus === "loading";

	return (
		<Card className="border-apple-card-border bg-apple-card-bg p-8">
			{formStatus === "success" && (
				<div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
					<CheckCircle className="h-5 w-5 text-green-600" />
					<p className="text-green-800">
						Versicherungseinstellungen erfolgreich aktualisiert!
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
						Firmenname
					</Label>
					<Input
						id="companyName"
						type="text"
						placeholder="Geben Sie Ihren Firmennamen ein"
						value={companyName}
						onChange={(event) => setCompanyName(event.target.value)}
						disabled={isFormDisabled}
						required
						className="border-apple-card-border bg-apple-gray-bg text-apple-text-primary placeholder:text-apple-text-tertiary"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="insuranceName" className="text-apple-text-primary">
						Versicherungsname
					</Label>
					<Input
						id="insuranceName"
						type="text"
						placeholder="z.B. Premium Geräteschutz"
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
						Versicherungsbeschreibung
					</Label>
					<Textarea
						id="insuranceDescription"
						placeholder="Beschreiben Sie Ihren Versicherungsschutz und die Vorteile..."
						value={insuranceDescription}
						onChange={(event) => setInsuranceDescription(event.target.value)}
						disabled={isFormDisabled}
						rows={4}
						className="border-apple-card-border bg-apple-gray-bg text-apple-text-primary placeholder:text-apple-text-tertiary"
					/>
				</div>

				<div className="space-y-2">
					<Label
						htmlFor="coverageDescription"
						className="text-apple-text-primary"
					>
						Deckungsdetails
					</Label>
					<Textarea
						id="coverageDescription"
						placeholder="Erklären Sie, was durch diese Versicherung abgedeckt ist (z.B. Diebstahl, Unfallschäden, Flüssigkeitsschäden)..."
						value={coverageDescription}
						onChange={(event) => setCoverageDescription(event.target.value)}
						disabled={isFormDisabled}
						rows={4}
						className="border-apple-card-border bg-apple-gray-bg text-apple-text-primary placeholder:text-apple-text-tertiary"
					/>
					<p className="text-sm text-apple-text-tertiary">
						Dies wird Kunden angezeigt, wenn sie Ihre Versicherung ansehen.
					</p>
				</div>

				<div className="space-y-2">
					<Label
						htmlFor="rightOfWithdrawal"
						className="text-apple-text-primary"
					>
						Widerrufsrecht
					</Label>
					<Textarea
						id="rightOfWithdrawal"
						placeholder="Beschreiben Sie die Stornierungsbedingungen und Kundenrechte..."
						value={rightOfWithdrawal}
						onChange={(event) => setRightOfWithdrawal(event.target.value)}
						disabled={isFormDisabled}
						rows={3}
						className="border-apple-card-border bg-apple-gray-bg text-apple-text-primary placeholder:text-apple-text-tertiary"
					/>
					<p className="text-sm text-apple-text-tertiary">
						Informationen über Widerrufsrechte und Rückerstattungsrichtlinien.
					</p>
				</div>

				{insurance.generatedSummary && (
					<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
						<Label className="text-blue-900">
							KI-generierte Zusammenfassung
						</Label>
						<p className="mt-2 text-sm text-blue-800">
							{insurance.generatedSummary}
						</p>
						{insurance.topReasons && insurance.topReasons.length > 0 && (
							<div className="mt-3">
								<Label className="text-blue-900">Top 3 Gründe</Label>
								<ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800">
									{insurance.topReasons.map((reason, reasonIndex) => (
										<li key={reasonIndex}>{reason}</li>
									))}
								</ul>
							</div>
						)}
						<p className="mt-3 text-xs text-blue-700">
							Dieser Inhalt wird automatisch generiert, wenn
							Versicherungsdokumente verarbeitet werden.
						</p>
					</div>
				)}

				<div className="space-y-3">
					<Label className="text-apple-text-primary">
						Unterstützte Produktkategorien
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
						Wählen Sie alle Produktkategorien aus, die Ihre Versicherung
						abdeckt.
					</p>
				</div>

				<div className="grid gap-6 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="yearlyPrice" className="text-apple-text-primary">
							Preis für 1 Jahr (€)
						</Label>
						<Input
							id="yearlyPrice"
							type="number"
							step="0.01"
							min="0"
							placeholder="47.88"
							value={yearlyPriceDollars}
							onChange={(event) => setYearlyPriceDollars(event.target.value)}
							disabled={isFormDisabled}
							className="border-apple-card-border bg-apple-gray-bg text-apple-text-primary placeholder:text-apple-text-tertiary"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="twoYearlyPrice" className="text-apple-text-primary">
							Preis für 2 Jahre (€)
						</Label>
						<Input
							id="twoYearlyPrice"
							type="number"
							step="0.01"
							min="0"
							placeholder="89.99"
							value={twoYearlyPriceDollars}
							onChange={(event) => setTwoYearlyPriceDollars(event.target.value)}
							disabled={isFormDisabled}
							className="border-apple-card-border bg-apple-gray-bg text-apple-text-primary placeholder:text-apple-text-tertiary"
						/>
					</div>
				</div>

				<div className="grid gap-6 sm:grid-cols-2">
					<div className="space-y-2">
						<Label
							htmlFor="coveragePercentage"
							className="text-apple-text-primary"
						>
							Deckung (%)
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
							Selbstbehalt (€)
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
						Vertrags-API-Endpunkt
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
						Der Endpunkt, an den unsere Plattform Vertrags-CRUD-Operationen
						sendet.
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
							Aktive Versicherung
						</span>
						<p className="text-sm text-apple-text-tertiary">
							Wenn aktiv, wird diese Versicherung für Produktempfehlungen
							verfügbar sein.
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
							Speichern...
						</>
					) : (
						"Änderungen speichern"
					)}
				</Button>
			</form>
		</Card>
	);
}
