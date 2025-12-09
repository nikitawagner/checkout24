"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/src/db";
import { insuranceCompaniesTable, policyFilesTable } from "@/src/db/schema";
import { storageService } from "@/src/lib/services";

type PolicyFileData = {
	fileName: string;
	fileContent: string;
	contentType: string;
};

type SaveInsuranceConfigurationRequest = {
	companyName: string;
	insuranceName: string;
	insuranceDescription: string;
	categories: string[];
	monthlyPriceInCents: number;
	coveragePercentage: number;
	deductibleInCents: number;
	apiEndpoint: string;
	policyFiles: PolicyFileData[];
};

type SaveInsuranceConfigurationResponse = {
	insuranceCompanyId: string;
	companyName: string;
	policyFilesCount: number;
};

const generateStoragePath = (
	insuranceCompanyId: string,
	fileName: string,
): string => {
	const timestamp = Date.now();
	const randomSuffix = Math.random().toString(36).substring(2, 8);
	const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");

	return `policy-files/${insuranceCompanyId}/${timestamp}-${randomSuffix}-${sanitizedFileName}`;
};

export async function saveInsuranceConfiguration(
	request: SaveInsuranceConfigurationRequest,
): Promise<SaveInsuranceConfigurationResponse> {
	const { userId: clerkUserId } = await auth();

	if (!clerkUserId) {
		throw new Error("Unauthorized - User must be authenticated");
	}

	const insuranceCompanyResult = await db
		.insert(insuranceCompaniesTable)
		.values({
			clerkUserId,
			companyName: request.companyName,
			insuranceName: request.insuranceName,
			insuranceDescription: request.insuranceDescription,
			categories: request.categories,
			monthlyPriceInCents: request.monthlyPriceInCents,
			coveragePercentage: request.coveragePercentage,
			deductibleInCents: request.deductibleInCents,
			apiEndpoint: request.apiEndpoint,
			isActive: 1,
		})
		.returning();

	const insuranceCompany = insuranceCompanyResult.at(0);

	if (!insuranceCompany) {
		throw new Error("Failed to create insurance company");
	}

	const uploadedPolicyFilesCount = await Promise.all(
		request.policyFiles.map(async (policyFileData) => {
			const fileBuffer = Buffer.from(policyFileData.fileContent, "base64");
			const blob = new Blob([fileBuffer], { type: policyFileData.contentType });

			const storagePath = generateStoragePath(
				insuranceCompany.id,
				policyFileData.fileName,
			);

			const uploadResult = await storageService.file.add(storagePath, blob);

			await db.insert(policyFilesTable).values({
				insuranceCompanyId: insuranceCompany.id,
				fileName: policyFileData.fileName,
				storageKey: uploadResult.path,
				storageUrl: uploadResult.publicUrl,
				fileSizeInBytes: fileBuffer.length,
				mimeType: policyFileData.contentType,
			});

			return true;
		}),
	);

	return {
		insuranceCompanyId: insuranceCompany.id,
		companyName: insuranceCompany.companyName,
		policyFilesCount: uploadedPolicyFilesCount.length,
	};
}
