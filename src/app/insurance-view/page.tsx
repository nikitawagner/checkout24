"use client";

import { CheckCircle, Loader2, X } from "lucide-react";
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
import { saveInsuranceConfiguration } from "./actions";

type PolicyFile = {
	id: string;
	name: string;
	file: File;
};

type FormStatus = "idle" | "loading" | "success" | "error";

const CENTS_PER_DOLLAR = 100;

const convertFileToBase64 = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			const base64Content = result.split(",").at(1) ?? "";
			resolve(base64Content);
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
};

export default function InsuranceViewPage() {
	const [companyName, setCompanyName] = useState("");
	const [insuranceName, setInsuranceName] = useState("");
	const [insuranceDescription, setInsuranceDescription] = useState("");
	const [coverageDescription, setCoverageDescription] = useState("");
	const [rightOfWithdrawal, setRightOfWithdrawal] = useState("");
	const [selectedCategories, setSelectedCategories] = useState<
		ProductCategory[]
	>([]);
	const [yearlyPriceDollars, setYearlyPriceDollars] = useState("");
	const [twoYearlyPriceDollars, setTwoYearlyPriceDollars] = useState("");
	const [coveragePercentage, setCoveragePercentage] = useState("");
	const [deductibleDollars, setDeductibleDollars] = useState("");
	const [apiEndpoint, setApiEndpoint] = useState("");
	const [policyFiles, setPolicyFiles] = useState<PolicyFile[]>([]);
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

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;

		if (!files) {
			return;
		}

		const newPolicyFiles = Array.from(files).map((file) => ({
			id: crypto.randomUUID(),
			name: file.name,
			file,
		}));

		setPolicyFiles((currentFiles) => [...currentFiles, ...newPolicyFiles]);
		event.target.value = "";
	};

	const removeFile = (fileId: string) => {
		setPolicyFiles((currentFiles) =>
			currentFiles.filter((policyFile) => policyFile.id !== fileId),
		);
	};

	const resetForm = () => {
		setCompanyName("");
		setInsuranceName("");
		setInsuranceDescription("");
		setCoverageDescription("");
		setRightOfWithdrawal("");
		setSelectedCategories([]);
		setYearlyPriceDollars("");
		setTwoYearlyPriceDollars("");
		setCoveragePercentage("");
		setDeductibleDollars("");
		setApiEndpoint("");
		setPolicyFiles([]);
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setFormStatus("loading");
		setErrorMessage("");

		try {
			const policyFilesData = await Promise.all(
				policyFiles.map(async (policyFile) => ({
					fileName: policyFile.name,
					fileContent: await convertFileToBase64(policyFile.file),
					contentType: policyFile.file.type || "application/octet-stream",
				})),
			);

			const yearlyPriceInCents = Math.round(
				Number.parseFloat(yearlyPriceDollars) * CENTS_PER_DOLLAR,
			);
			const twoYearlyPriceInCents = Math.round(
				Number.parseFloat(twoYearlyPriceDollars) * CENTS_PER_DOLLAR,
			);
			const deductibleInCents = Math.round(
				Number.parseFloat(deductibleDollars) * CENTS_PER_DOLLAR,
			);
			const coveragePercentageValue = Number.parseInt(coveragePercentage, 10);

			await saveInsuranceConfiguration({
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
				apiEndpoint,
				policyFiles: policyFilesData,
			});

			setFormStatus("success");
			resetForm();
		} catch (error) {
			setFormStatus("error");
			const isError = error instanceof Error;
			setErrorMessage(
				isError ? error.message : "Ein unerwarteter Fehler ist aufgetreten",
			);
		}
	};

	const isFormDisabled = formStatus === "loading";

	return (
		<div className="min-h-screen bg-apple-gray-bg">
			<div className="mx-auto max-w-screen-md px-6 py-16">
				<header className="mb-12 text-center">
					<h1 className="font-sans text-4xl font-semibold tracking-tight text-apple-text-primary md:text-5xl">
						Versicherungsportal
					</h1>
					<p className="mt-4 text-lg text-apple-text-secondary">
						Laden Sie Ihre Versicherungsdokumente hoch und konfigurieren Sie
						Ihre Integration.
					</p>
				</header>

				{formStatus === "success" && (
					<div className="mb-8 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
						<CheckCircle className="h-5 w-5 text-green-600" />
						<p className="text-green-800">
							Konfiguration erfolgreich gespeichert! Ihre
							Versicherungsgesellschaft wurde registriert.
						</p>
					</div>
				)}

				{formStatus === "error" && (
					<div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4">
						<p className="text-red-800">{errorMessage}</p>
					</div>
				)}

				<Card className="border-apple-card-border bg-apple-card-bg p-8">
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
							<Label
								htmlFor="insuranceName"
								className="text-apple-text-primary"
							>
								Versicherungsname
							</Label>
							<Input
								id="insuranceName"
								type="text"
								placeholder="z.B. Premium Geräteschutz"
								value={insuranceName}
								onChange={(event) => setInsuranceName(event.target.value)}
								disabled={isFormDisabled}
								required
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
								onChange={(event) =>
									setInsuranceDescription(event.target.value)
								}
								disabled={isFormDisabled}
								required
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
								Informationen über Widerrufsrechte und
								Rückerstattungsrichtlinien.
							</p>
						</div>

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
								<Label
									htmlFor="yearlyPrice"
									className="text-apple-text-primary"
								>
									Preis für 1 Jahr (€)
								</Label>
								<Input
									id="yearlyPrice"
									type="number"
									step="0.01"
									min="0"
									placeholder="47.88"
									value={yearlyPriceDollars}
									onChange={(event) =>
										setYearlyPriceDollars(event.target.value)
									}
									disabled={isFormDisabled}
									required
									className="border-apple-card-border bg-apple-gray-bg text-apple-text-primary placeholder:text-apple-text-tertiary"
								/>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="twoYearlyPrice"
									className="text-apple-text-primary"
								>
									Preis für 2 Jahre (€)
								</Label>
								<Input
									id="twoYearlyPrice"
									type="number"
									step="0.01"
									min="0"
									placeholder="89.99"
									value={twoYearlyPriceDollars}
									onChange={(event) =>
										setTwoYearlyPriceDollars(event.target.value)
									}
									disabled={isFormDisabled}
									required
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
									onChange={(event) =>
										setCoveragePercentage(event.target.value)
									}
									disabled={isFormDisabled}
									required
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
									required
									className="border-apple-card-border bg-apple-gray-bg text-apple-text-primary placeholder:text-apple-text-tertiary"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="policyDocuments"
								className="text-apple-text-primary"
							>
								Versicherungsdokumente
							</Label>
							<Input
								id="policyDocuments"
								type="file"
								multiple
								accept=".pdf,.doc,.docx"
								onChange={handleFileChange}
								disabled={isFormDisabled}
								className="cursor-pointer border-apple-card-border bg-apple-gray-bg text-apple-text-primary file:mr-4 file:rounded-md file:border-0 file:bg-apple-blue file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-apple-blue/90"
							/>
							<p className="text-sm text-apple-text-tertiary">
								Laden Sie PDF- oder Word-Dokumente hoch. Sie können mehrere
								Dateien auswählen.
							</p>

							{policyFiles.length > 0 && (
								<div className="mt-4 space-y-2">
									{policyFiles.map((policyFile) => (
										<div
											key={policyFile.id}
											className="flex items-center justify-between rounded-lg border border-apple-card-border bg-apple-gray-bg px-4 py-2"
										>
											<span className="truncate text-sm text-apple-text-primary">
												{policyFile.name}
											</span>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => removeFile(policyFile.id)}
												disabled={isFormDisabled}
												className="ml-2 h-8 w-8 p-0 text-apple-text-secondary hover:text-apple-text-primary"
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
							)}
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
								"Konfiguration speichern"
							)}
						</Button>
					</form>
				</Card>
			</div>
		</div>
	);
}
