"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PolicyFile {
	id: string;
	name: string;
	file: File;
}

export default function InsuranceViewPage() {
	const [companyName, setCompanyName] = useState("");
	const [apiEndpoint, setApiEndpoint] = useState("");
	const [policyFiles, setPolicyFiles] = useState<PolicyFile[]>([]);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;

		if (!files) {
			return;
		}

		const newPolicyFiles = Array.from(files).map((file) => ({
			id: crypto.randomUUID(),
			name: file.name,
			file,
		}));

		setPolicyFiles((currentFiles) => [...currentFiles, ...newPolicyFiles]);
		event.target.value = "";
	};

	const removeFile = (fileId: string) => {
		setPolicyFiles((currentFiles) =>
			currentFiles.filter((policyFile) => policyFile.id !== fileId),
		);
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		console.log({
			companyName,
			apiEndpoint,
			policyFiles: policyFiles.map((policyFile) => policyFile.name),
		});
	};

	return (
		<div className="min-h-screen bg-apple-gray-bg">
			<div className="mx-auto max-w-screen-md px-6 py-16">
				<header className="mb-12 text-center">
					<h1 className="font-sans text-4xl font-semibold tracking-tight text-apple-text-primary md:text-5xl">
						Insurance Portal
					</h1>
					<p className="mt-4 text-lg text-apple-text-secondary">
						Upload your policy documents and configure your integration.
					</p>
				</header>

				<Card className="border-apple-card-border bg-apple-card-bg p-8">
					<form onSubmit={handleSubmit} className="space-y-8">
						<div className="space-y-2">
							<Label htmlFor="companyName" className="text-apple-text-primary">
								Company Name
							</Label>
							<Input
								id="companyName"
								type="text"
								placeholder="Enter your company name"
								value={companyName}
								onChange={(event) => setCompanyName(event.target.value)}
								className="border-apple-card-border bg-apple-gray-bg text-apple-text-primary placeholder:text-apple-text-tertiary"
							/>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="policyDocuments"
								className="text-apple-text-primary"
							>
								Policy Documents
							</Label>
							<Input
								id="policyDocuments"
								type="file"
								multiple
								accept=".pdf,.doc,.docx"
								onChange={handleFileChange}
								className="cursor-pointer border-apple-card-border bg-apple-gray-bg text-apple-text-primary file:mr-4 file:rounded-md file:border-0 file:bg-apple-blue file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-apple-blue/90"
							/>
							<p className="text-sm text-apple-text-tertiary">
								Upload PDF or Word documents. You can select multiple files.
							</p>

							{policyFiles.length > 0 && (
								<div className="mt-4 space-y-2">
									{policyFiles.map((policyFile) => (
										<div
											key={policyFile.id}
											className="flex items-center justify-between rounded-lg border border-apple-card-border bg-apple-gray-bg px-4 py-2"
										>
											<span className="truncate text-sm text-apple-text-primary">
												{policyFile.name}
											</span>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => removeFile(policyFile.id)}
												className="ml-2 h-8 w-8 p-0 text-apple-text-secondary hover:text-apple-text-primary"
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="apiEndpoint" className="text-apple-text-primary">
								Contract API Endpoint
							</Label>
							<Input
								id="apiEndpoint"
								type="url"
								placeholder="https://api.your-insurance.com/contracts"
								value={apiEndpoint}
								onChange={(event) => setApiEndpoint(event.target.value)}
								className="border-apple-card-border bg-apple-gray-bg text-apple-text-primary placeholder:text-apple-text-tertiary"
							/>
							<p className="text-sm text-apple-text-tertiary">
								The endpoint where our platform will send contract CRUD
								operations.
							</p>
						</div>

						<Button
							type="submit"
							className="w-full bg-apple-blue text-white hover:bg-apple-blue/90"
						>
							Save Configuration
						</Button>
					</form>
				</Card>
			</div>
		</div>
	);
}
