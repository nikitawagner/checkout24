export const STORAGE_CONFIG = {
	provider: "s3",
	bucket: process.env.STORAGE_BUCKET || "checkout24",
	region: process.env.STORAGE_REGION || "us-east-1",
	publicUrl: process.env.STORAGE_PUBLIC_URL || "",
} as const;

export type StorageConfig = {
	provider: string;
	bucket: string;
	region: string;
	publicUrl: string;
	accessKeyId?: string;
	secretAccessKey?: string;
	endpoint?: string;
};

