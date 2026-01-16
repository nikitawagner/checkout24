"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useCart } from "@/lib/context/cart-context";
import { getProductById } from "@/lib/data/products";

export default function ThankYouPage() {
	const { clearCart, items } = useCart();

	const orderNumber = `#${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
	const orderDate = new Date().toLocaleString();

	const subtotal = items.reduce((sum, item) => {
		const product = getProductById(item.productId);
		if (!product) return sum;
		return (
			sum +
			product.basePrice * item.quantity +
			(item.insurancePriceInCents || 0)
		);
	}, 0);

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-12">
			<div className="max-w-5xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
					<div className="lg:col-span-2">
						<Card className="border-0 shadow-md">
							<CardContent className="p-8">
								<div className="flex items-start gap-6">
									<div className="flex-shrink-0">
										<div className="rounded-full bg-green-100 p-4 inline-flex">
											<CheckCircle className="h-12 w-12 text-green-600" />
										</div>
									</div>

									<div>
										<h1 className="text-3xl font-bold text-gray-900">
											Thank you — your order is confirmed
										</h1>
										<p className="mt-2 text-gray-600">
											We've sent a confirmation email with your receipt and
											shipping information.
										</p>

										<div className="mt-6 grid grid-cols-2 gap-4">
											<div className="text-sm text-gray-500">
												<div className="font-medium text-gray-800">Order</div>
												<div>{orderNumber}</div>
											</div>
											<div className="text-sm text-gray-500">
												<div className="font-medium text-gray-800">Placed</div>
												<div>{orderDate}</div>
											</div>
										</div>

										<div className="mt-6 flex gap-3">
											<Link href="/customer-view">
												<Button variant="default">View Orders</Button>
											</Link>
											<a href="#" onClick={(e) => e.preventDefault()}>
												<Button variant="outline">Download Receipt</Button>
											</a>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						<div className="mt-6 space-y-4">
							<Card className="shadow-sm">
								<CardHeader>
									<CardTitle>Items in your order</CardTitle>
								</CardHeader>
								<CardContent className="p-4">
									{items.length === 0 ? (
										<p className="text-sm text-gray-500">
											No items (cart was cleared).
										</p>
									) : (
										items.map((item) => {
											const product = getProductById(item.productId);
											if (!product) return null;
											return (
												<div
													key={item.productId}
													className="flex items-center gap-4 py-3 border-b last:border-b-0"
												>
													<div className="w-16 h-16 relative rounded-md bg-gray-100 overflow-hidden">
														<Image
															src={product.colors[0].imageUrl}
															alt={product.name}
															fill
															className="object-contain p-2"
														/>
													</div>
													<div className="flex-1">
														<div className="font-medium text-gray-900">
															{product.name}
														</div>
														<div className="text-sm text-gray-500">
															Qty: {item.quantity}
														</div>
													</div>
													<div className="text-right">
														<div className="font-medium">
															$
															{(
																(product.basePrice * item.quantity +
																	(item.insurancePriceInCents || 0)) /
																100
															).toFixed(2)}
														</div>
													</div>
												</div>
											);
										})
									)}
								</CardContent>
							</Card>
						</div>
					</div>

					<aside className="lg:col-span-1">
						<Card className="sticky top-20">
							<CardContent className="p-6">
								<h3 className="text-lg font-medium">Order summary</h3>
								<div className="mt-4 space-y-2">
									<div className="flex justify-between text-sm text-gray-600">
										<span>Subtotal</span>
										<span>${(subtotal / 100).toFixed(2)}</span>
									</div>
									<div className="flex justify-between text-sm text-gray-600">
										<span>Shipping</span>
										<span>Free</span>
									</div>
									<div className="flex justify-between text-sm text-gray-600">
										<span>Taxes</span>
										<span>Calculated at checkout</span>
									</div>
								</div>

								<div className="mt-6 border-t pt-4">
									<div className="flex justify-between text-lg font-bold">
										<span>Total</span>
										<span>${(subtotal / 100).toFixed(2)}</span>
									</div>
								</div>

								<div className="mt-6">
									<Link href="/" onClick={() => clearCart()}>
										<Button className="w-full">Back to Home</Button>
									</Link>
								</div>
							</CardContent>
						</Card>
					</aside>
				</div>

				<div className="text-center mt-8 text-gray-600">
					<p>Questions? Contact our support team at support@checkout24.com</p>
				</div>
			</div>
		</div>
	);
}
