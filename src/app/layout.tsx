import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { CartProvider } from "@/lib/context/cart-context";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "TechStore - Premium Consumer Electronics",
	description: "Shop the latest smartphones, laptops, tablets, and accessories",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
			<html lang="en">
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				>
					<CartProvider>
						<Navbar />
						<main className="pt-12">{children}</main>
					</CartProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
