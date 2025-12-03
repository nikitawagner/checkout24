import { auth } from "@clerk/nextjs/server";
import type { StorageDeps } from "./deps";
import {
	getFileKey,
	validateDeleteResponse,
	validateUploadResponse,
} from "./internal";
import type {
	DeleteRequest,
	DeleteResponse,
	GetUrlRequest,
	GetUrlResponse,
	UploadRequest,
	UploadResponse,
} from "./types";

export type IStorageService = {
	upload: (request: UploadRequest) => Promise<UploadResponse>;
	delete: (request: DeleteRequest) => Promise<DeleteResponse>;
	getUrl: (request: GetUrlRequest) => Promise<GetUrlResponse>;
};

export const createStorageService = (deps: StorageDeps): IStorageService => {
	const { config: storageConfig } = deps;

	const upload = async (request: UploadRequest): Promise<UploadResponse> => {
		const { userId } = await auth();

		if (!userId) {
			throw new Error("Unauthorized - User must be authenticated");
		}

		const key = getFileKey(request.fileName, request.folder, userId);

		let fileBuffer: Buffer;
		if (request.file instanceof Buffer) {
			fileBuffer = request.file;
		} else if (request.file instanceof Blob || request.file instanceof File) {
			const arrayBuffer = await request.file.arrayBuffer();
			fileBuffer = Buffer.from(arrayBuffer);
		} else {
			throw new Error("Invalid file type");
		}

		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

		if (supabaseUrl && supabaseKey) {
			const formData = new FormData();
			const blob = new Blob([fileBuffer], {
				type: request.contentType || "application/octet-stream",
			});
			formData.append("file", blob, request.fileName);

			const response = await fetch(
				`${supabaseUrl}/storage/v1/object/${storageConfig.bucket}/${key}`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${supabaseKey}`,
						"x-upsert": "true",
					},
					body: formData,
				},
			);

			if (!response.ok) {
				const error = await response.text();
				throw new Error(
					`Storage upload error: ${response.statusText} - ${error}`,
				);
			}

			const publicUrl = request.public
				? `${supabaseUrl}/storage/v1/object/public/${storageConfig.bucket}/${key}`
				: `${supabaseUrl}/storage/v1/object/${storageConfig.bucket}/${key}`;

			return validateUploadResponse({
				url: publicUrl,
				key,
				userId,
				timestamp: new Date(),
			});
		}

		throw new Error("Storage provider not configured");
	};

	const deleteFile = async (
		request: DeleteRequest,
	): Promise<DeleteResponse> => {
		const { userId } = await auth();

		if (!userId) {
			throw new Error("Unauthorized - User must be authenticated");
		}

		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

		if (supabaseUrl && supabaseKey) {
			const response = await fetch(
				`${supabaseUrl}/storage/v1/object/${storageConfig.bucket}/${request.key}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${supabaseKey}`,
					},
				},
			);

			if (!response.ok && response.status !== 404) {
				const error = await response.text();
				throw new Error(
					`Storage delete error: ${response.statusText} - ${error}`,
				);
			}

			return validateDeleteResponse({
				success: true,
				userId,
				timestamp: new Date(),
			});
		}

		throw new Error("Storage provider not configured");
	};

	const getUrl = async (request: GetUrlRequest): Promise<GetUrlResponse> => {
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

		if (supabaseUrl && supabaseKey) {
			const expiresIn = request.expiresIn || 3600;

			const response = await fetch(
				`${supabaseUrl}/storage/v1/object/sign/${storageConfig.bucket}/${request.key}?expiresIn=${expiresIn}`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${supabaseKey}`,
					},
				},
			);

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`Storage URL error: ${response.statusText} - ${error}`);
			}

			const data = await response.json();
			const signedUrl = `${supabaseUrl}${data.signedURL}`;

			return {
				url: signedUrl,
				expiresAt: new Date(Date.now() + expiresIn * 1000),
			};
		}

		throw new Error("Storage provider not configured");
	};

	return {
		upload: upload,
		delete: deleteFile,
		getUrl,
	};
};
