export type StorageBucket = "files" | "images" | "audio";

export type AddResponse = {
	path: string;
	publicUrl: string;
};

export type GetResponse = {
	publicUrl: string;
};

export type UpdateResponse = {
	path: string;
	publicUrl: string;
};

export type DeleteResponse = {
	isDeleted: boolean;
};
