import type { DeleteResponse, UploadResponse } from "./types";

export const validateUploadResponse = (response: unknown): UploadResponse => {
	if (!response || typeof response !== "object") {
		throw new Error("Invalid upload response: response is not an object");
	}

	const resp = response as Record<string, unknown>;

	if (typeof resp.url !== "string") {
		throw new Error("Invalid upload response: url is not a string");
	}

	if (typeof resp.key !== "string") {
		throw new Error("Invalid upload response: key is not a string");
	}

	if (typeof resp.userId !== "string") {
		throw new Error("Invalid upload response: userId is not a string");
	}

	return {
		url: resp.url,
		key: resp.key,
		userId: resp.userId,
		timestamp:
			resp.timestamp instanceof Date
				? resp.timestamp
				: new Date(resp.timestamp as string),
	};
};

export const validateDeleteResponse = (response: unknown): DeleteResponse => {
	if (!response || typeof response !== "object") {
		throw new Error("Invalid delete response: response is not an object");
	}

	const resp = response as Record<string, unknown>;

	if (typeof resp.success !== "boolean") {
		throw new Error("Invalid delete response: success is not a boolean");
	}

	if (typeof resp.userId !== "string") {
		throw new Error("Invalid delete response: userId is not a string");
	}

	return {
		success: resp.success,
		userId: resp.userId,
		timestamp:
			resp.timestamp instanceof Date
				? resp.timestamp
				: new Date(resp.timestamp as string),
	};
};

export const getFileKey = (
	fileName: string,
	folder?: string,
	userId?: string,
) => {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(7);
	const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");

	const parts = [
		...(userId ? [userId] : []),
		...(folder ? [folder] : []),
		`${timestamp}-${random}-${sanitizedFileName}`,
	];

	return parts.join("/");
};
