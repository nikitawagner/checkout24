"use client";

import type { ProductColor } from "@/lib/types/product";
import { cn } from "@/lib/utils";

type ColorSelectorProps = {
	colors: ProductColor[];
	selectedColorName: string;
	onColorSelect: (colorName: string) => void;
};

export function ColorSelector({
	colors,
	selectedColorName,
	onColorSelect,
}: ColorSelectorProps) {
	const hasMultipleColors = colors.length > 1;

	if (!hasMultipleColors) {
		return null;
	}

	return (
		<div className="flex items-center gap-2">
			{colors.map((color) => {
				const isSelected = color.name === selectedColorName;
				const isLightColor = isLightHex(color.hexValue);

				return (
					<button
						key={color.name}
						type="button"
						onClick={() => onColorSelect(color.name)}
						className={cn(
							"size-4 rounded-full transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2",
							isSelected && "ring-2 ring-apple-text-primary ring-offset-2",
							isLightColor && "border border-border",
						)}
						style={{ backgroundColor: color.hexValue }}
						aria-label={`Select ${color.name}`}
						aria-pressed={isSelected}
					/>
				);
			})}
		</div>
	);
}

function isLightHex(hexColor: string): boolean {
	const hex = hexColor.replace("#", "");
	const red = Number.parseInt(hex.substring(0, 2), 16);
	const green = Number.parseInt(hex.substring(2, 4), 16);
	const blue = Number.parseInt(hex.substring(4, 6), 16);
	const brightness = (red * 299 + green * 587 + blue * 114) / 1_000;

	return brightness > 200;
}
