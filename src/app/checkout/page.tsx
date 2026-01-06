"use client";

import { useCart } from "@/lib/context/cart-context";
import { getProductById, products } from "@/lib/data/products";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, ArrowRight } from "lucide-react";
import Link from "next/link";
import { InsuranceModal } from "@/components/insurance-modal";

export default function CheckoutPage() {
	const { items, getTotalItems, hasInsurance, getInsurancePrice } = useCart();
	const [selectedProductForInsurance, setSelectedProductForInsurance] =
		useState<string | null>(null);
	const [showInsuranceModal, setShowInsuranceModal] = useState(false);

	if (getTotalItems() === 0) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-12">
				<div className="max-w-2xl mx-auto text-center">
					<h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
					<p className="text-gray-600 mb-8">
						Add some products to get started with checkout
					</p>
					<Link href="/">
						<Button size="lg">
							Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	const calculateSubtotal = () => {
		return items.reduce((total, item) => {
			const product = getProductById(item.productId);
			if (!product) return total;
			return total + (product.basePrice * item.quantity * 100) / 100;
		}, 0);
	};

	const calculateInsuranceTotal = () => {
		return items.reduce((total, item) => {
			const insurancePrice = getInsurancePrice(item.productId);
			return total + (insurancePrice ? (insurancePrice * item.quantity) / 100 : 0);
		}, 0);
	};

	const subtotal = calculateSubtotal();
	const insuranceTotal = calculateInsuranceTotal();
	const total = subtotal + insuranceTotal;

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-8">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-4xl font-bold mb-8">Order Review</h1>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Products */}
					<div className="lg:col-span-2">
						<Card>
							<CardHeader>
								<CardTitle>Items in Cart ({getTotalItems()})</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								{items.map((item) => {
									const product = getProductById(item.productId);
									if (!product) return null;

									const hasItemInsurance = hasInsurance(item.productId);
									const insurancePrice = getInsurancePrice(item.productId);
									const itemSubtotal = (product.basePrice * item.quantity * 100) / 100;
									const itemInsuranceTotal = insurancePrice
										? (insurancePrice * item.quantity) / 100
										: 0;
									const itemTotal = itemSubtotal + itemInsuranceTotal;

									return (
										<div key={item.productId} className="space-y-4">
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<h3 className="font-semibold text-lg">{product.name}</h3>
													<p className="text-gray-600">
														Qty: {item.quantity} × ${(product.basePrice / 100).toFixed(2)}
													</p>
												</div>
												<div className="text-right">
													<p className="font-semibold">
														${(itemSubtotal / 100).toFixed(2)}
													</p>
												</div>
											</div>

											{/* Insurance Section */}
											<div className="bg-blue-50 p-4 rounded-lg">
												<div className="flex items-center justify-between mb-3">
													<div className="flex items-center gap-2">
														<Shield className="h-4 w-4 text-blue-600" />
														<span className="font-medium">Product Protection</span>
													</div>
													{hasItemInsurance && (
														<span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
															Added
														</span>
													)}
												</div>

												{hasItemInsurance ? (
													<div className="flex justify-between items-center">
														<span className="text-gray-700">
															Insurance: ${(itemInsuranceTotal / 100).toFixed(2)}
														</span>
														<Button
															variant="outline"
															size="sm"
															onClick={() => {
																setSelectedProductForInsurance(item.productId);
																setShowInsuranceModal(true);
															}}
														>
															Modify
														</Button>
													</div>
												) : (
													<Button
														variant="outline"
														size="sm"
														className="w-full"
														onClick={() => {
															setSelectedProductForInsurance(item.productId);
															setShowInsuranceModal(true);
														}}
													>
														Add Protection
													</Button>
												)}
											</div>

											<Separator />
										</div>
									);
								})}
							</CardContent>
						</Card>
					</div>

					{/* Order Summary */}
					<div className="lg:col-span-1">
						<Card className="sticky top-8">
							<CardHeader>
								<CardTitle>Order Summary</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex justify-between">
									<span className="text-gray-600">Subtotal</span>
									<span className="font-medium">${(subtotal / 100).toFixed(2)}</span>
								</div>

								{insuranceTotal > 0 && (
									<>
										<div className="flex justify-between">
											<span className="text-gray-600">Insurance</span>
											<span className="font-medium">
												${(insuranceTotal / 100).toFixed(2)}
											</span>
										</div>
										<Separator />
									</>
								)}

								<div className="flex justify-between text-lg font-bold bg-gray-50 p-3 rounded">
									<span>Total</span>
									<span>${(total / 100).toFixed(2)}</span>
								</div>

								<Link href="/checkout/form">
									<Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
										Proceed to Payment
									</Button>
								</Link>

								<Link href="/">
									<Button
										variant="outline"
										size="sm"
										className="w-full"
									>
										Continue Shopping
									</Button>
								</Link>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			{/* Insurance Modal */}
			{showInsuranceModal && selectedProductForInsurance && (() => {
				const product = getProductById(selectedProductForInsurance);
				if (!product) return null;
				return (
					<InsuranceModal
						isOpen={showInsuranceModal}
						productId={selectedProductForInsurance}
						productName={product.name}
						productCategory={product.category}
						productPriceInCents={product.basePrice * 100}
						onClose={() => {
							setShowInsuranceModal(false);
							setSelectedProductForInsurance(null);
						}}
					/>
				);
			})()}
		</div>
	);
}
