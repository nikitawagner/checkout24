"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductFiltersProps = {
	categories: string[];
	selectedCategory: string;
	onCategorySelect: (category: string) => void;
	searchQuery: string;
	onSearchChange: (query: string) => void;
};

export function ProductFilters({
	categories,
	selectedCategory,
	onCategorySelect,
	searchQuery,
	onSearchChange,
}: ProductFiltersProps) {
	return (
		<div className="mb-8 flex flex-col gap-4">
			<div className="relative">
				<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-apple-text-secondary" />
				<input
					type="text"
					placeholder="Search products..."
					value={searchQuery}
					onChange={(event) => onSearchChange(event.target.value)}
					className="h-10 w-full rounded-full border border-border bg-apple-card-bg pl-10 pr-4 text-sm text-apple-text-primary placeholder:text-apple-text-secondary focus:border-apple-blue focus:outline-none focus:ring-2 focus:ring-apple-blue/20"
				/>
			</div>

			<div className="flex flex-wrap gap-2">
				{categories.map((category) => {
					const isSelected = category === selectedCategory;

					return (
						<button
							key={category}
							type="button"
							onClick={() => onCategorySelect(category)}
							className={cn(
								"rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
								isSelected
									? "bg-apple-blue text-white"
									: "bg-apple-card-bg text-apple-text-primary hover:bg-apple-blue/10",
							)}
						>
							{category}
						</button>
					);
				})}
			</div>
		</div>
	);
}
