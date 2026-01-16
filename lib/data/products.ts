import type { Product } from "@/lib/types/product";

const productsData: Product[] = [
	{
		id: "roborock-vacuum",
		name: "Roborock S8 Pro Ultra",
		category: "Smart Home",
		basePrice: 999,
		isNew: true,
		colors: [
			{
				name: "White",
				hexValue: "#f5f5f7",
				imageUrl: "/roborock-vacuum.jpg",
			},
		],
	},
	{
		id: "iphone-17",
		name: "iPhone 17",
		category: "Smartphone",
		basePrice: 799,
		isNew: true,
		colors: [
			{
				name: "Black",
				hexValue: "#1d1d1f",
				imageUrl: "/iphone17.jpg",
			},
		],
	},
	{
		id: "fujifilm-x100vi",
		name: "Fujifilm X100VI",
		category: "Camera",
		basePrice: 1_599,
		isNew: true,
		colors: [
			{
				name: "Silver",
				hexValue: "#e3e4e5",
				imageUrl: "/fuji-cam.jpg",
			},
		],
	},
	{
		id: "macbook-air-15",
		name: 'MacBook Air 15"',
		category: "Laptop",
		basePrice: 1_299,
		colors: [
			{
				name: "Space Gray",
				hexValue: "#7d7e80",
				imageUrl: "/macbook-air.jpeg",
			},
		],
	},
	{
		id: "sonos-era-300",
		name: "Sonos Era 300",
		category: "Speaker",
		basePrice: 449,
		colors: [
			{
				name: "White",
				hexValue: "#f5f5f7",
				imageUrl: "/sonos-speaker.jpg",
			},
		],
	},
	{
		id: "ipad-pro-13",
		name: 'iPad Pro 13"',
		category: "Tablet",
		basePrice: 1_099,
		isNew: true,
		colors: [
			{
				name: "Space Black",
				hexValue: "#1d1d1f",
				imageUrl: "/ipad-pro.jpg",
			},
		],
	},
	{
		id: "e-bike-pro",
		name: "E-Bike Pro",
		category: "E-Bike",
		basePrice: 2_499,
		colors: [
			{
				name: "Black",
				hexValue: "#1d1d1f",
				imageUrl: "/e-bike.jpg",
			},
		],
	},
	{
		id: "airpods-pro",
		name: "AirPods Pro",
		category: "Earbuds",
		basePrice: 249,
		colors: [
			{
				name: "White",
				hexValue: "#f5f5f7",
				imageUrl: "/airpods-pro.jpg",
			},
		],
	},
	{
		id: "red-komodo",
		name: "RED Komodo 6K",
		category: "Camera",
		basePrice: 5_999,
		colors: [
			{
				name: "Red",
				hexValue: "#c41e3a",
				imageUrl: "/red-camera.webp",
			},
		],
	},
	{
		id: "apple-watch-ultra",
		name: "Apple Watch Ultra 2",
		category: "Smart Watch",
		basePrice: 799,
		colors: [
			{
				name: "Natural Titanium",
				hexValue: "#c4b7a6",
				imageUrl: "/watch-ultra.jpeg",
			},
		],
	},
	{
		id: "roborock-zeo-one",
		name: "Roborock Zeo One",
		category: "Smart Home",
		basePrice: 1_299,
		isNew: true,
		colors: [
			{
				name: "White",
				hexValue: "#f5f5f7",
				imageUrl: "/roboroc-washing-mashine.jpg",
			},
		],
	},
	{
		id: "airpods-max",
		name: "AirPods Max",
		category: "Headphones",
		basePrice: 549,
		colors: [
			{
				name: "Space Gray",
				hexValue: "#7d7e80",
				imageUrl: "/airpods-max.jpg",
			},
		],
	},
	{
		id: "macbook-pro-14",
		name: 'MacBook Pro 14"',
		category: "Laptop",
		basePrice: 1_999,
		colors: [
			{
				name: "Space Black",
				hexValue: "#1d1d1f",
				imageUrl: "/macbook-pro.jpeg",
			},
		],
	},
	{
		id: "apple-watch-series-10",
		name: "Apple Watch Series 10",
		category: "Smart Watch",
		basePrice: 399,
		isNew: true,
		colors: [
			{
				name: "Jet Black",
				hexValue: "#1d1d1f",
				imageUrl: "/watch-s10.jpg",
			},
		],
	},
	{
		id: "homepod-mini",
		name: "HomePod mini",
		category: "Speaker",
		basePrice: 99,
		colors: [
			{
				name: "White",
				hexValue: "#f5f5f7",
				imageUrl: "/homepod-mini.jpg",
			},
		],
	},
];

export const products = productsData;
