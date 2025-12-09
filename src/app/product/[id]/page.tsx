"use client";

import { ArrowLeft, Check, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { products } from "@/lib/data/products";

export default function ProductDetailPage() {
	const params = useParams();
	const productId = params.id as string;

	const product = products.find((productItem) => productItem.id === productId);

	if (!product) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-apple-gray-bg">
				<div className="text-center">
					<h1 className="text-2xl font-semibold text-apple-text-primary">
						Product not found
					</h1>
					<Link
						href="/"
						className="mt-4 inline-block text-apple-blue hover:underline"
					>
						Back to shop
					</Link>
				</div>
			</div>
		);
	}

	const selectedColor = product.colors.at(0);

	const formattedPrice = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(product.basePrice);

	return (
		<div className="min-h-screen bg-apple-gray-bg">
			<div className="mx-auto max-w-screen-xl px-6 py-8">
				<Link
					href="/"
					className="mb-8 inline-flex items-center gap-2 text-apple-blue hover:underline"
				>
					<ArrowLeft className="size-4" />
					Back to shop
				</Link>

				<div className="grid gap-12 lg:grid-cols-2">
					<div className="relative aspect-square overflow-hidden rounded-3xl bg-white">
						{selectedColor && (
							<Image
								src={selectedColor.imageUrl}
								alt={product.name}
								fill
								className="object-contain p-8"
								priority
								sizes="(max-width: 1024px) 100vw, 50vw"
							/>
						)}
					</div>

					<div className="flex flex-col justify-center">
						<div className="mb-2">
							<span className="text-sm font-medium text-apple-blue">
								{product.category}
							</span>
						</div>

						<h1 className="mb-4 font-sans text-4xl font-semibold tracking-tight text-apple-text-primary md:text-5xl">
							{product.name}
						</h1>

						<p className="mb-8 text-3xl font-medium text-apple-text-primary">
							{formattedPrice}
						</p>

						<div className="mb-8 space-y-4">
							<div className="flex items-center gap-3 text-apple-text-secondary">
								<Truck className="size-5" />
								<span>Free delivery</span>
							</div>
							<div className="flex items-center gap-3 text-apple-text-secondary">
								<Check className="size-5" />
								<span>In stock and ready to ship</span>
							</div>
						</div>

						<div className="space-y-4">
							<AddToCartButton
								productId={product.id}
								productName={product.name}
								productCategory={product.category}
								productPriceInCents={product.basePrice * 100}
							/>

							<p className="text-center text-sm text-apple-text-secondary">
								Order now for delivery within 2-4 business days
							</p>
						</div>

						<div className="mt-12 border-t border-border pt-8">
							<h2 className="mb-4 text-lg font-semibold text-apple-text-primary">
								Highlights
							</h2>
							<ul className="space-y-3 text-apple-text-secondary">
								<li className="flex items-start gap-3">
									<Check className="mt-0.5 size-4 shrink-0 text-apple-blue" />
									<span>Premium build quality</span>
								</li>
								<li className="flex items-start gap-3">
									<Check className="mt-0.5 size-4 shrink-0 text-apple-blue" />
									<span>Industry-leading performance</span>
								</li>
								<li className="flex items-start gap-3">
									<Check className="mt-0.5 size-4 shrink-0 text-apple-blue" />
									<span>1-year warranty included</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
