"use client";

import confetti from "canvas-confetti";
import {
	Check,
	ChevronDown,
	ChevronUp,
	Download,
	Loader2,
	MessageCircle,
	Shield,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/lib/context/cart-context";
import type {
	InsurancePlanDuration,
	InsuranceRecommendation,
} from "@/lib/types/insurance";
import { getRecommendedInsurances } from "@/src/actions/insurance";
import { InsuranceChat, InsuranceSwitcher } from "./insurance-modal/index";

type InsuranceModalProps = {
	isOpen: boolean;
	onClose: () => void;
	productId: string;
	productName: string;
	productCategory: string;
	productPriceInCents: number;
};

const CENTS_PER_DOLLAR = 100;

const formatCurrency = (cents: number): string => {
	const euros = cents / CENTS_PER_DOLLAR;

	return new Intl.NumberFormat("de-DE", {
		style: "currency",
		currency: "EUR",
	}).format(euros);
};

export function InsuranceModal({
	isOpen,
	onClose,
	productId,
	productName,
	productCategory,
	productPriceInCents,
}: InsuranceModalProps) {
	const { setInsurance, getInsurancePrice, hasInsurance } = useCart();
	const isInsuranceInCart = hasInsurance(productId);
	const cartInsurancePriceInCents = isInsuranceInCart
		? getInsurancePrice(productId)
		: null;
	const [insurances, setInsurances] = useState<InsuranceRecommendation[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [selectedPlanDuration, setSelectedPlanDuration] =
		useState<InsurancePlanDuration>("two-yearly");
	const [isLoadingRecommendations, setIsLoadingRecommendations] =
		useState(true);
	const [error, setError] = useState<string | null>(null);
	const [hasAgreed, setHasAgreed] = useState(false);
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [isWithdrawalExpanded, setIsWithdrawalExpanded] = useState(false);
	const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
	const [isReasonsExpanded, setIsReasonsExpanded] = useState(false);
	const [isCoverageExpanded, setIsCoverageExpanded] = useState(false);

	const selectedInsurance = insurances.at(selectedIndex);
	const isSelectedRecommended = selectedIndex === 0;

	const displayedPrice =
		selectedPlanDuration === "yearly"
			? selectedInsurance?.yearlyPriceInCents
			: selectedInsurance?.twoYearlyPriceInCents;

	const priceLabel =
		selectedPlanDuration === "yearly" ? "pro Jahr" : "für 2 Jahre";

	const loadRecommendations = useCallback(async () => {
		setIsLoadingRecommendations(true);
		setError(null);

		const result = await getRecommendedInsurances(
			productCategory,
			productPriceInCents,
		);

		if (result.success) {
			setInsurances(result.data);

			if (result.data.length === 0) {
				setError(
					"Keine Versicherungsoptionen für diese Produktkategorie verfügbar.",
				);
			}
		} else {
			setError(
				"Fehler beim Laden der Versicherungsempfehlungen. Bitte versuchen Sie es erneut.",
			);
		}

		setIsLoadingRecommendations(false);
	}, [productCategory, productPriceInCents]);

	useEffect(() => {
		if (isOpen) {
			loadRecommendations();
			setHasAgreed(false);
			setIsChatOpen(false);
			setIsWithdrawalExpanded(false);
			setIsSummaryExpanded(false);
			setIsReasonsExpanded(false);
			setIsCoverageExpanded(false);
		}
	}, [isOpen, loadRecommendations]);

	const handleSelectInsurance = (index: number) => {
		setSelectedIndex(index);
		setHasAgreed(false);
	};

	const handleAddInsurance = () => {
		setInsurance(productId, true, displayedPrice ?? null, selectedPlanDuration);
		onClose();
	};

	const handleClose = () => {
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl p-0 gap-0">
				{/* Header */}
				<DialogHeader className="px-6 pt-6 pb-4 space-y-2">
					<DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900">
						Schützen Sie Ihr {productName}
					</DialogTitle>
					<DialogDescription className="text-sm text-slate-600">
						Umfassender Schutz ab{" "}
						{formatCurrency(selectedInsurance?.yearlyPriceInCents ?? 0)}
					</DialogDescription>
				</DialogHeader>

				{isLoadingRecommendations ? (
					<div className="flex h-64 items-center justify-center px-6">
						<div className="text-center">
							<Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
							<p className="mt-3 text-sm text-slate-600">
								Versicherungsoptionen werden geladen...
							</p>
						</div>
					</div>
				) : error ? (
					<div className="flex h-64 items-center justify-center px-6">
						<div className="text-center">
							<p className="text-sm text-slate-600">{error}</p>
							<Button
								variant="outline"
								onClick={loadRecommendations}
								className="mt-4"
							>
								Erneut versuchen
							</Button>
						</div>
					</div>
				) : selectedInsurance ? (
					<>
						<div className="px-6 space-y-5 pb-6">
							{/* Insurance Name & Recommended Badge */}
							<div className="flex items-start justify-between gap-3">
								<div>
									<h3 className="text-lg font-semibold text-slate-900">
										{selectedInsurance.insuranceName}
									</h3>
									<p className="text-sm text-slate-600 mt-0.5">
										von {selectedInsurance.companyName}
									</p>
								</div>
								{isSelectedRecommended && (
									<div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-700">
										<Shield className="h-3.5 w-3.5" />
										Empfohlen
									</div>
								)}
							</div>

							{/* Price & Duration Section */}
							<div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-5 border border-slate-200/60 shadow-sm">
								<div className="flex items-center justify-between gap-6">
									<div className="flex-1">
										<p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2.5">
											Laufzeit
										</p>
										<div className="flex gap-2">
											<button
												type="button"
												onClick={() => setSelectedPlanDuration("yearly")}
												className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
													selectedPlanDuration === "yearly"
														? "bg-slate-900 text-white shadow-md"
														: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
												}`}
											>
												1 Jahr
											</button>
											<button
												type="button"
												onClick={() => setSelectedPlanDuration("two-yearly")}
												className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
													selectedPlanDuration === "two-yearly"
														? "bg-slate-900 text-white shadow-md"
														: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
												}`}
											>
												2 Jahre
											</button>
										</div>
									</div>
									<div className="text-right border-l border-slate-300 pl-6">
										<p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
											Preis
										</p>
										<p className="mt-1 text-3xl font-bold text-slate-900 tracking-tight">
											{formatCurrency(displayedPrice ?? 0)}
										</p>
										<p className="text-xs text-slate-500 mt-0.5">
											{priceLabel}
										</p>
									</div>
								</div>
							</div>

							{/* Insurance Switcher */}
							<InsuranceSwitcher
								insurances={insurances}
								selectedIndex={selectedIndex}
								onSelect={handleSelectInsurance}
								cartInsurancePriceInCents={cartInsurancePriceInCents}
								selectedPlanDuration={selectedPlanDuration}
							/>

							{/* Key Stats */}
							<div className="grid grid-cols-2 gap-3">
								<div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-lg p-4 border border-emerald-200/60">
									<p className="text-xs font-semibold text-emerald-900/70 uppercase tracking-wide">
										Deckung
									</p>
									<p className="mt-1.5 text-3xl font-bold text-emerald-900">
										{selectedInsurance.coveragePercentage}%
									</p>
								</div>
								<div className="bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-lg p-4 border border-amber-200/60">
									<p className="text-xs font-semibold text-amber-900/70 uppercase tracking-wide">
										Selbstbehalt
									</p>
									<p className="mt-1.5 text-2xl font-bold text-amber-900">
										{formatCurrency(selectedInsurance.deductibleInCents)}
									</p>
								</div>
							</div>

							{/* Expandable: What's Included */}
							{selectedInsurance.generatedSummary && (
								<div className="border border-slate-200 rounded-lg overflow-hidden">
									<button
										type="button"
										onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
										className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
									>
										<span className="text-sm font-semibold text-slate-900">
											Was ist enthalten
										</span>
										{isSummaryExpanded ? (
											<ChevronUp className="h-4 w-4 text-slate-600" />
										) : (
											<ChevronDown className="h-4 w-4 text-slate-600" />
										)}
									</button>
									{isSummaryExpanded && (
										<div className="p-4 bg-white border-t border-slate-200">
											<p className="text-sm leading-relaxed text-slate-700">
												{selectedInsurance.generatedSummary}
											</p>
										</div>
									)}
								</div>
							)}

							{/* Expandable: Top 3 Reasons */}
							{selectedInsurance.topReasons &&
								selectedInsurance.topReasons.length > 0 && (
									<div className="border border-slate-200 rounded-lg overflow-hidden">
										<button
											type="button"
											onClick={() => setIsReasonsExpanded(!isReasonsExpanded)}
											className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
										>
											<span className="text-sm font-semibold text-slate-900">
												Top 3 Gründe für diese Versicherung
											</span>
											{isReasonsExpanded ? (
												<ChevronUp className="h-4 w-4 text-slate-600" />
											) : (
												<ChevronDown className="h-4 w-4 text-slate-600" />
											)}
										</button>
										{isReasonsExpanded && (
											<div className="p-4 bg-white border-t border-slate-200 space-y-3">
												{selectedInsurance.topReasons.map(
													(reason, reasonIndex) => (
														<div
															key={`reason-${selectedInsurance.insuranceCompanyId}-${reasonIndex}`}
															className="flex items-start gap-3"
														>
															<div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white mt-0.5">
																{reasonIndex + 1}
															</div>
															<p className="text-sm leading-relaxed text-slate-700 flex-1">
																{reason}
															</p>
														</div>
													),
												)}
											</div>
										)}
									</div>
								)}

							{/* Expandable: Coverage Details */}
							{selectedInsurance.coverageDescription && (
								<div className="border border-slate-200 rounded-lg overflow-hidden">
									<button
										type="button"
										onClick={() => setIsCoverageExpanded(!isCoverageExpanded)}
										className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
									>
										<span className="text-sm font-semibold text-slate-900">
											Deckungsdetails
										</span>
										{isCoverageExpanded ? (
											<ChevronUp className="h-4 w-4 text-slate-600" />
										) : (
											<ChevronDown className="h-4 w-4 text-slate-600" />
										)}
									</button>
									{isCoverageExpanded && (
										<div className="p-4 bg-white border-t border-slate-200">
											<p className="text-sm leading-relaxed text-slate-700">
												{selectedInsurance.coverageDescription}
											</p>
										</div>
									)}
								</div>
							)}

							{/* Agreement Checkbox / Morphing Button */}
							{!hasAgreed ? (
								<div className="bg-slate-50 rounded-xl p-5 border border-slate-200 animate-in fade-in duration-300">
									<label
										htmlFor="insurance-agreement"
										className="flex cursor-pointer items-start gap-3"
									>
										<Checkbox
											id="insurance-agreement"
											checked={hasAgreed}
											onCheckedChange={(checked) => {
												if (checked === true) {
													setHasAgreed(true);
													confetti({
														particleCount: 100,
														spread: 70,
														origin: { y: 0.6 },
														colors: ["#14b8a6", "#2dd4bf", "#5eead4"],
													});
												}
											}}
											className="mt-1"
										/>
										<div className="flex-1">
											<p className="text-sm font-medium text-slate-900">
												Ich möchte diese Versicherung freiwillig hinzufügen
											</p>
											<p className="mt-1.5 text-xs leading-relaxed text-slate-600">
												Mit dem Aktivieren dieser Checkbox bestätigen Sie, dass
												Sie die Deckungsdetails, Bedingungen und Konditionen
												gelesen und verstanden haben. Diese Versicherung ist
												optional.
											</p>
										</div>
									</label>
								</div>
							) : (
								<div className="animate-in zoom-in duration-300">
									<Button
										onClick={handleAddInsurance}
										className="w-full h-auto py-5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-lg hover:shadow-xl transition-all"
									>
										<Check className="mr-2 h-5 w-5" />
										<div className="flex-1 text-left">
											<p className="text-base font-semibold">
												Versicherung hinzufügen
											</p>
											<p className="text-xs font-normal opacity-90 mt-0.5">
												Mit{" "}
												{selectedPlanDuration === "yearly"
													? "1 Jahr"
													: "2 Jahren"}{" "}
												Laufzeit für{" "}
												{new Intl.NumberFormat("de-DE", {
													style: "currency",
													currency: "EUR",
												}).format((displayedPrice ?? 0) / 100)}
											</p>
										</div>
									</Button>
									<button
										type="button"
										onClick={() => setHasAgreed(false)}
										className="w-full mt-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
									>
										Abbrechen
									</button>
								</div>
							)}

							{/* Legal Information - Minimized & Moved Down */}
							<details className="group px-6">
								<summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1.5 py-2 list-none">
									<ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
									<span>Rechtliche Informationen & Dokumente</span>
								</summary>
								<div className="mt-3 space-y-2 pl-1 pb-2">
									{selectedInsurance.rightOfWithdrawal && (
										<div className="border border-slate-200 rounded-lg overflow-hidden">
											<button
												type="button"
												onClick={() =>
													setIsWithdrawalExpanded(!isWithdrawalExpanded)
												}
												className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
											>
												<span className="text-xs font-medium text-slate-700">
													Widerrufsrecht & Stornierung
												</span>
												{isWithdrawalExpanded ? (
													<ChevronUp className="h-3 w-3 text-slate-500" />
												) : (
													<ChevronDown className="h-3 w-3 text-slate-500" />
												)}
											</button>
											{isWithdrawalExpanded && (
												<div className="p-3 bg-white border-t border-slate-200">
													<p className="text-xs leading-relaxed text-slate-600">
														{selectedInsurance.rightOfWithdrawal}
													</p>
												</div>
											)}
										</div>
									)}
									<button
										type="button"
										onClick={() => {
											window.open(
												selectedInsurance.insuranceDescription,
												"_blank",
											);
										}}
										className="w-full flex items-center justify-start gap-2 p-3 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
									>
										<Download className="h-3 w-3" />
										Versicherungsbedingungen herunterladen
									</button>
								</div>
							</details>
						</div>

						{/* Footer CTAs */}
						{!hasAgreed && (
							<DialogFooter className="px-6 py-4 border-t border-slate-200 bg-slate-50/50">
								<Button
									variant="ghost"
									onClick={handleClose}
									className="w-full text-slate-600 hover:text-slate-900 hover:bg-slate-100"
								>
									Ohne Versicherung fortfahren
								</Button>
							</DialogFooter>
						)}

						{/* Floating Chat Button */}
						<button
							type="button"
							onClick={() => setIsChatOpen(true)}
							className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-lg hover:bg-slate-800 transition-all hover:scale-105 group z-50"
							aria-label="Chat öffnen"
						>
							<MessageCircle className="h-5 w-5" />
							<span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
								Fragen? Wir helfen!
							</span>
						</button>

						{/* Chat Drawer Overlay */}
						{isChatOpen && (
							<div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center">
								<div className="bg-white w-full sm:max-w-lg sm:rounded-xl shadow-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-300">
									<div className="flex items-center justify-between p-4 border-b border-slate-200">
										<h3 className="font-semibold text-slate-900">
											Fragen zu {selectedInsurance.insuranceName}
										</h3>
										<button
											type="button"
											onClick={() => setIsChatOpen(false)}
											className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
											aria-label="Chat schließen"
										>
											<X className="h-5 w-5 text-slate-600" />
										</button>
									</div>
									<div className="flex-1 overflow-y-auto p-4">
										<InsuranceChat
											insuranceCompanyId={selectedInsurance.insuranceCompanyId}
											insuranceName={selectedInsurance.insuranceName}
										/>
									</div>
								</div>
							</div>
						)}
					</>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
