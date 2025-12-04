export type ProductColor = {
	name: string;
	hexValue: string;
	imageUrl: string;
};

export type Product = {
	id: string;
	name: string;
	category: string;
	basePrice: number;
	colors: ProductColor[];
	isNew?: boolean;
};
