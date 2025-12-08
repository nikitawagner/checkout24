import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-apple-gray-bg">
			<div className="mx-auto flex max-w-screen-xl flex-col items-center justify-center px-6 py-32">
				<header className="mb-16 text-center">
					<h1 className="font-sans text-4xl font-semibold tracking-tight text-apple-text-primary md:text-5xl">
						Hannovate Insurance Platform
					</h1>
					<p className="mt-4 text-lg text-apple-text-secondary">
						Connecting Insurance Companies with E-Commerce Merchants
					</p>
				</header>

				<div className="flex flex-col gap-6 sm:flex-row">
					<Button
						asChild
						size="lg"
						className="min-w-48 bg-apple-blue text-white hover:bg-apple-blue/90"
					>
						<Link href="/customer-view">Customer View</Link>
					</Button>
					<Button
						asChild
						size="lg"
						variant="outline"
						className="min-w-48 border-apple-card-border text-apple-text-primary hover:bg-apple-card-bg"
					>
						<Link href="/insurance-view">Insurance View</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
