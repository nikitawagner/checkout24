"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ColorSelector } from "@/components/color-selector";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/lib/types/product";

type ProductCardProps = {
	product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
	const initialColor = product.colors.at(0);
	const [selectedColorName, setSelectedColorName] = useState(
		initialColor?.name ?? "",
	);

	const selectedColor =
		product.colors.find((color) => color.name === selectedColorName) ??
		initialColor;

	const formattedPrice = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(product.basePrice);

	return (
		<Link href={`/product/${product.id}`}>
			<Card className="group cursor-pointer border-0 bg-apple-card-bg shadow-none transition-shadow duration-300 hover:shadow-lg">
				<CardContent className="flex flex-col gap-4 p-4">
					<AspectRatio
						ratio={1}
						className="overflow-hidden rounded-xl bg-white"
					>
						{selectedColor && (
							<Image
								src={selectedColor.imageUrl}
								alt={`${product.name} in ${selectedColor.name}`}
								fill
								className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
								sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
							/>
						)}
					</AspectRatio>

					<div className="flex flex-col gap-3">
						<div className="flex items-start justify-between gap-2">
							<div className="flex flex-col gap-1">
								<h3 className="font-sans text-base font-medium text-apple-text-primary">
									{product.name}
								</h3>
								<p className="text-sm text-apple-text-secondary">
									{product.category}
								</p>
							</div>
							{product.isNew && (
								<Badge
									variant="secondary"
									className="shrink-0 bg-apple-blue text-white hover:bg-apple-blue"
								>
									New
								</Badge>
							)}
						</div>

						<ColorSelector
							colors={product.colors}
							selectedColorName={selectedColorName}
							onColorSelect={setSelectedColorName}
						/>

						<p className="font-sans text-base font-medium text-apple-text-primary">
							{formattedPrice}
						</p>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
