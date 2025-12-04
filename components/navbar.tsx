"use client";

import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { CartDropdown } from "@/components/cart-dropdown";

export function Navbar() {
	return (
		<nav className="fixed left-0 right-0 top-0 z-50 h-12 border-b border-border/50 bg-apple-card-bg/80 backdrop-blur-lg">
			<div className="mx-auto flex h-full max-w-screen-xl items-center justify-between px-6">
				<Link
					href="/"
					className="text-lg font-semibold text-apple-text-primary"
				>
					TechStore
				</Link>

				<div className="flex items-center gap-3">
					<CartDropdown />
					<SignedOut>
						<SignInButton />
						<SignUpButton />
					</SignedOut>
					<SignedIn>
						<UserButton />
					</SignedIn>
				</div>
			</div>
		</nav>
	);
}
