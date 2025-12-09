export const STORAGE_CONFIG = {
	buckets: {
		files: "files",
		images: "images",
		audio: "audio",
	},
} as const;

export type StorageConfig = {
	supabaseUrl: string;
	supabaseAnonKey: string;
	buckets: typeof STORAGE_CONFIG.buckets;
};
