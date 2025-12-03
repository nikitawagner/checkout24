export type UploadRequest = {
	file: File | Blob | Buffer;
	fileName: string;
	folder?: string;
	contentType?: string;
	public?: boolean;
};

export type UploadResponse = {
	url: string;
	key: string;
	userId: string;
	timestamp: Date;
};

export type DeleteRequest = {
	key: string;
};

export type DeleteResponse = {
	success: boolean;
	userId: string;
	timestamp: Date;
};

export type GetUrlRequest = {
	key: string;
	expiresIn?: number; // seconds
};

export type GetUrlResponse = {
	url: string;
	expiresAt?: Date;
};
