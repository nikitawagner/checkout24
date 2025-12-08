"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { products } from "@/lib/data/products";

const ALL_CATEGORY = "All";

export default function CustomerViewPage() {
	const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
	const [searchQuery, setSearchQuery] = useState("");

	const categories = useMemo(() => {
		const uniqueCategories = [
			...new Set(products.map((product) => product.category)),
		];

		return [ALL_CATEGORY, ...uniqueCategories.sort()];
	}, []);

	const filteredProducts = useMemo(() => {
		const normalizedQuery = searchQuery.toLowerCase().trim();

		return products.filter((product) => {
			const matchesCategory =
				selectedCategory === ALL_CATEGORY ||
				product.category === selectedCategory;

			const matchesSearch =
				normalizedQuery === "" ||
				product.name.toLowerCase().includes(normalizedQuery) ||
				product.category.toLowerCase().includes(normalizedQuery);

			return matchesCategory && matchesSearch;
		});
	}, [selectedCategory, searchQuery]);

	const hasNoResults = filteredProducts.length === 0;

	return (
		<div className="min-h-screen bg-apple-gray-bg">
			<div className="mx-auto max-w-screen-xl px-6 py-16">
				<header className="mb-12 text-center">
					<h1 className="font-sans text-4xl font-semibold tracking-tight text-apple-text-primary md:text-5xl">
						Shop the latest.
					</h1>
					<p className="mt-4 text-lg text-apple-text-secondary">
						Explore our collection of premium electronics.
					</p>
				</header>

				<ProductFilters
					categories={categories}
					selectedCategory={selectedCategory}
					onCategorySelect={setSelectedCategory}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
				/>

				{hasNoResults ? (
					<div className="py-16 text-center">
						<p className="text-lg text-apple-text-secondary">
							No products found matching your criteria.
						</p>
						<button
							type="button"
							onClick={() => {
								setSelectedCategory(ALL_CATEGORY);
								setSearchQuery("");
							}}
							className="mt-4 text-apple-blue hover:underline"
						>
							Clear filters
						</button>
					</div>
				) : (
					<section className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
						{filteredProducts.map((product) => (
							<ProductCard key={product.id} product={product} />
						))}
					</section>
				)}
			</div>
		</div>
	);
}
