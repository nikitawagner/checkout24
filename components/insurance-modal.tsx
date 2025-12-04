"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

type InsuranceModalProps = {
	isOpen: boolean;
	onClose: () => void;
	productId: string;
	productName: string;
};

export function InsuranceModal({
	isOpen,
	onClose,
	productName,
}: InsuranceModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold text-apple-text-primary">
						Insurance Options
					</DialogTitle>
					<DialogDescription className="text-apple-text-secondary">
						Protect your {productName} with our coverage plans
					</DialogDescription>
				</DialogHeader>

				<div className="py-6">
					<p className="text-apple-text-primary">Hello World</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
