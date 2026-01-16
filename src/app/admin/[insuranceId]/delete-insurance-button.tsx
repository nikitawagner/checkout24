"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteInsuranceCompany } from "./actions";

type DeleteInsuranceButtonProps = {
	insuranceId: string;
	companyName: string;
};

export function DeleteInsuranceButton({
	insuranceId,
	companyName,
}: DeleteInsuranceButtonProps) {
	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);

		const result = await deleteInsuranceCompany(insuranceId);

		if (result.success) {
			router.push("/admin");
		} else {
			setIsDeleting(false);
			setIsOpen(false);
		}
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogTrigger asChild>
				<Button variant="destructive" className="gap-2" disabled={isDeleting}>
					<Trash2 className="h-4 w-4" />
					Delete Insurance
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Insurance Company</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete &quot;{companyName}&quot;? This will
						permanently remove the insurance company, all associated policy
						files, and their embeddings. This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={isDeleting}
						className="bg-destructive text-white hover:bg-destructive/90"
					>
						{isDeleting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Deleting...
							</>
						) : (
							"Delete"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
