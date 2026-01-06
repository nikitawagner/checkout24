"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/context/cart-context";
import { getProductById } from "@/lib/data/products";
import Link from "next/link";

export default function CheckoutFormPage() {
	const router = useRouter();
	const { items, getTotalItems } = useCart();
	const [isLoading, setIsLoading] = useState(false);

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		address: "",
		city: "",
		state: "",
		zipCode: "",
		cardNumber: "",
		expiryDate: "",
		cvv: "",
	});

	if (getTotalItems() === 0) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-12">
				<div className="max-w-2xl mx-auto text-center">
					<h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
					<Link href="/">
						<Button size="lg">Continue Shopping</Button>
					</Link>
				</div>
			</div>
		);
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		// Simulate payment processing
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Redirect to thank you page
		router.push("/checkout/thank-you");
	};

	const calculateTotal = () => {
		return items.reduce((total, item) => {
			const product = getProductById(item.productId);
			if (!product) return total;
			return total + product.basePrice * item.quantity;
		}, 0);
	};

	const total = calculateTotal();

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-4xl font-bold mb-8">Checkout</h1>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Form */}
					<div className="lg:col-span-2">
						<Card>
							<CardHeader>
								<CardTitle>Delivery & Payment Information</CardTitle>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} className="space-y-6">
									{/* Personal Info */}
									<div className="space-y-4">
										<h3 className="text-lg font-semibold">Personal Information</h3>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<Label htmlFor="firstName">First Name</Label>
												<Input
													id="firstName"
													name="firstName"
													value={formData.firstName}
													onChange={handleInputChange}
													required
													placeholder="John"
												/>
											</div>
											<div>
												<Label htmlFor="lastName">Last Name</Label>
												<Input
													id="lastName"
													name="lastName"
													value={formData.lastName}
													onChange={handleInputChange}
													required
													placeholder="Doe"
												/>
											</div>
										</div>
										<div>
											<Label htmlFor="email">Email</Label>
											<Input
												id="email"
												name="email"
												type="email"
												value={formData.email}
												onChange={handleInputChange}
												required
												placeholder="john@example.com"
											/>
										</div>
										<div>
											<Label htmlFor="phone">Phone Number</Label>
											<Input
												id="phone"
												name="phone"
												value={formData.phone}
												onChange={handleInputChange}
												required
												placeholder="(555) 123-4567"
											/>
										</div>
									</div>

									{/* Address */}
									<div className="space-y-4">
										<h3 className="text-lg font-semibold">Delivery Address</h3>
										<div>
											<Label htmlFor="address">Street Address</Label>
											<Input
												id="address"
												name="address"
												value={formData.address}
												onChange={handleInputChange}
												required
												placeholder="123 Main St"
											/>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<Label htmlFor="city">City</Label>
												<Input
													id="city"
													name="city"
													value={formData.city}
													onChange={handleInputChange}
													required
													placeholder="New York"
												/>
											</div>
											<div>
												<Label htmlFor="state">State</Label>
												<Input
													id="state"
													name="state"
													value={formData.state}
													onChange={handleInputChange}
													required
													placeholder="NY"
												/>
											</div>
										</div>
										<div>
											<Label htmlFor="zipCode">ZIP Code</Label>
											<Input
												id="zipCode"
												name="zipCode"
												value={formData.zipCode}
												onChange={handleInputChange}
												required
												placeholder="10001"
											/>
										</div>
									</div>

									{/* Payment */}
									<div className="space-y-4">
										<h3 className="text-lg font-semibold">Payment Information</h3>
										<div>
											<Label htmlFor="cardNumber">Card Number</Label>
											<Input
												id="cardNumber"
												name="cardNumber"
												value={formData.cardNumber}
												onChange={handleInputChange}
												required
												placeholder="4532 1234 5678 9010"
											/>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<Label htmlFor="expiryDate">Expiry Date</Label>
												<Input
													id="expiryDate"
													name="expiryDate"
													value={formData.expiryDate}
													onChange={handleInputChange}
													required
													placeholder="MM/YY"
												/>
											</div>
											<div>
												<Label htmlFor="cvv">CVV</Label>
												<Input
													id="cvv"
													name="cvv"
													value={formData.cvv}
													onChange={handleInputChange}
													required
													placeholder="123"
												/>
											</div>
										</div>
									</div>

									<div className="flex gap-4">
										<Link href="/checkout" className="flex-1">
											<Button
												type="button"
												variant="outline"
												className="w-full"
												disabled={isLoading}
											>
												Back
											</Button>
										</Link>
										<Button
											type="submit"
											size="lg"
											className="flex-1 bg-green-600 hover:bg-green-700"
											disabled={isLoading}
										>
											{isLoading ? "Processing..." : "Complete Purchase"}
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>
					</div>

					{/* Order Summary */}
					<div>
						<Card className="sticky top-8">
							<CardHeader>
								<CardTitle>Order Summary</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{items.map((item) => {
									const product = getProductById(item.productId);
									if (!product) return null;
									return (
										<div key={item.productId} className="text-sm">
											<div className="flex justify-between mb-2">
												<span>{product.name}</span>
												<span>${(product.basePrice * item.quantity / 100).toFixed(2)}</span>
											</div>
										</div>
									);
								})}
								<div className="border-t pt-4">
									<div className="flex justify-between font-bold text-lg">
										<span>Total</span>
										<span>${(total / 100).toFixed(2)}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
