"use client";

import { Eye, FileText, Loader2, Play } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { processPolicyFile } from "./actions";

type PolicyFileCardProps = {
	policyFile: {
		id: string;
		fileName: string;
		storageUrl: string;
		fileSizeInBytes: number | null;
		mimeType: string | null;
		isProcessed: number;
	};
};

const formatFileSize = (sizeInBytes: number | null): string => {
	if (sizeInBytes === null) {
		return "Unknown size";
	}

	const sizeInKilobytes = Math.round(sizeInBytes / 1_024);

	return `${sizeInKilobytes} KB`;
};

export function PolicyFileCard({ policyFile }: PolicyFileCardProps) {
	const [isProcessing, setIsProcessing] = useState(false);
	const [isProcessed, setIsProcessed] = useState(policyFile.isProcessed === 1);
	const [errorMessage, setErrorMessage] = useState("");

	const handleProcess = async () => {
		setIsProcessing(true);
		setErrorMessage("");

		try {
			await processPolicyFile(policyFile.id);
			setIsProcessed(true);
		} catch (error) {
			const isError = error instanceof Error;
			setErrorMessage(isError ? error.message : "Failed to process file");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<Card className="border-apple-card-border bg-apple-card-bg">
			<CardHeader className="flex flex-row items-center gap-4">
				<FileText className="h-8 w-8 text-apple-blue" />
				<div className="flex-1">
					<CardTitle className="text-lg text-apple-text-primary">
						{policyFile.fileName}
					</CardTitle>
					<CardDescription className="text-apple-text-tertiary">
						{policyFile.mimeType ?? "Unknown type"} |{" "}
						{formatFileSize(policyFile.fileSizeInBytes)}
					</CardDescription>
					{errorMessage && (
						<p className="mt-1 text-sm text-red-500">{errorMessage}</p>
					)}
				</div>
				<div className="flex items-center gap-3">
					<a
						href={policyFile.storageUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Button variant="outline" size="sm">
							<Eye className="mr-2 h-4 w-4" />
							Open
						</Button>
					</a>
					{isProcessed ? (
						<span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
							Processed
						</span>
					) : (
						<Button
							variant="default"
							size="sm"
							onClick={handleProcess}
							disabled={isProcessing}
							className="bg-apple-blue hover:bg-apple-blue/90"
						>
							{isProcessing ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Processing...
								</>
							) : (
								<>
									<Play className="mr-2 h-4 w-4" />
									Process
								</>
							)}
						</Button>
					)}
				</div>
			</CardHeader>
		</Card>
	);
}
