"use client";

import { Minus, Plus, Shield, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useCart } from "@/lib/context/cart-context";
import { products } from "@/lib/data/products";

const CENTS_PER_EURO = 100;

export function CartDropdown() {
	const { items, addItem, removeItem, getTotalItems, clearCart } = useCart();
	const totalItems = getTotalItems();

	const cartProducts = items.map((item) => {
		const product = products.find(
			(productItem) => productItem.id === item.productId,
		);

		return {
			...item,
			product,
		};
	});

	const totalPrice = cartProducts.reduce((sum, item) => {
		if (!item.product) return sum;

		const productTotal = item.product.basePrice * item.quantity;
		const insurancePriceInEuros = item.insurancePriceInCents
			? item.insurancePriceInCents / CENTS_PER_EURO
			: 0;
		const insuranceTotal = item.hasInsurance ? insurancePriceInEuros : 0;

		return sum + productTotal + insuranceTotal;
	}, 0);

	const formattedTotal = new Intl.NumberFormat("de-DE", {
		style: "currency",
		currency: "EUR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(totalPrice);

	return (
		<>
			<Popover>
				<PopoverTrigger asChild>
					<button
						type="button"
						className="relative flex size-10 items-center justify-center rounded-full text-apple-text-primary transition-colors hover:bg-apple-blue/10"
					>
						<ShoppingBag className="size-5" />
						{totalItems > 0 && (
							<span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-apple-blue text-xs font-medium text-white">
								{totalItems > 99 ? "99+" : totalItems}
							</span>
						)}
					</button>
				</PopoverTrigger>
				<PopoverContent
					align="end"
					className="w-80 border-border bg-apple-card-bg p-0"
				>
					<div className="border-b border-border p-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold text-apple-text-primary">
								Ihr Warenkorb
							</h3>
							{totalItems > 0 && (
								<button
									type="button"
									onClick={clearCart}
									className="text-sm text-apple-text-secondary hover:text-apple-text-primary"
								>
									Alles löschen
								</button>
							)}
						</div>
					</div>

					{totalItems === 0 ? (
						<div className="flex flex-col items-center gap-3 p-8">
							<ShoppingBag className="size-12 text-apple-text-secondary" />
							<p className="text-center text-apple-text-secondary">
								Ihr Warenkorb ist leer
							</p>
							<Link
								href="/"
								className="text-sm font-medium text-apple-blue hover:underline"
							>
								Weiter einkaufen
							</Link>
						</div>
					) : (
						<>
							<div className="max-h-80 overflow-y-auto">
								{cartProducts.map((item) => {
									if (!item.product) return null;

									const productColor = item.product.colors.at(0);
									const itemPrice = new Intl.NumberFormat("de-DE", {
										style: "currency",
										currency: "EUR",
										minimumFractionDigits: 0,
										maximumFractionDigits: 0,
									}).format(item.product.basePrice * item.quantity);

									return (
										<div
											key={item.productId}
											className="flex gap-3 border-b border-border p-4 last:border-b-0"
										>
											<Link
												href={`/product/${item.productId}`}
												className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-white"
											>
												{productColor && (
													<Image
														src={productColor.imageUrl}
														alt={item.product.name}
														fill
														className="object-contain p-1"
														sizes="64px"
													/>
												)}
											</Link>

											<div className="flex flex-1 flex-col gap-1">
												<Link
													href={`/product/${item.productId}`}
													className="text-sm font-medium text-apple-text-primary hover:text-apple-blue"
												>
													{item.product.name}
												</Link>
												<p className="text-sm text-apple-text-secondary">
													{itemPrice}
												</p>

												{item.hasInsurance &&
													item.insurancePriceInCents !== null && (
														<p className="flex items-center gap-1 text-xs text-green-600">
															<Shield className="size-3" />
															Versicherung +
															{new Intl.NumberFormat("de-DE", {
																style: "currency",
																currency: "EUR",
															}).format(item.insurancePriceInCents / 100)}
															/
															{item.insurancePlanDuration === "yearly"
																? "Jahr"
																: "2 Jahre"}
														</p>
													)}

												{/* Protected / Unprotected badge */}
												{item.hasInsurance ? (
													<p className="flex items-center gap-1 text-xs text-green-600">
														<Shield className="size-3" />
														Geschützt
													</p>
												) : (
													<p className="flex items-center gap-1 text-xs text-apple-text-secondary">
														<Shield className="size-3 opacity-50" />
														Kein Schutz
													</p>
												)}

												<div className="mt-1 flex items-center gap-2">
													<button
														type="button"
														onClick={() => removeItem(item.productId)}
														className="flex size-6 items-center justify-center rounded-md text-apple-text-secondary hover:bg-apple-blue/10 hover:text-apple-text-primary"
													>
														<Minus className="size-3" />
													</button>
													<span className="min-w-[1.5rem] text-center text-sm font-medium text-apple-text-primary">
														{item.quantity}
													</span>
													<button
														type="button"
														onClick={() => addItem(item.productId)}
														className="flex size-6 items-center justify-center rounded-md text-apple-text-secondary hover:bg-apple-blue/10 hover:text-apple-text-primary"
													>
														<Plus className="size-3" />
													</button>

													<button
														type="button"
														onClick={() => {
															Array.from({ length: item.quantity }).map(() =>
																removeItem(item.productId),
															);
														}}
														className="ml-auto flex size-6 items-center justify-center rounded-md text-apple-text-secondary hover:bg-red-500/10 hover:text-red-500"
													>
														<X className="size-3" />
													</button>
												</div>
											</div>
										</div>
									);
								})}
							</div>

							<div className="border-t border-border p-4 space-y-3">
								<div className="flex items-center justify-between">
									<span className="font-medium text-apple-text-primary">
										Gesamt
									</span>
									<span className="text-lg font-semibold text-apple-text-primary">
										{formattedTotal}
									</span>
								</div>
								<Link href="/checkout" className="block">
									<Button className="h-12 w-full rounded-xl bg-apple-blue text-base font-medium text-white hover:bg-apple-blue/90">
										Zur Kasse
									</Button>
								</Link>
							</div>
						</>
					)}
				</PopoverContent>
			</Popover>
		</>
	);
}
