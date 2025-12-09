import type { StorageDeps } from "./deps";
import { buildPublicUrl } from "./internal";
import type {
	AddResponse,
	DeleteResponse,
	GetResponse,
	StorageBucket,
	UpdateResponse,
} from "./types";

type BucketOperations = {
	add: (path: string, file: File | Blob) => Promise<AddResponse>;
	get: (path: string) => GetResponse;
	update: (path: string, file: File | Blob) => Promise<UpdateResponse>;
	delete: (path: string) => Promise<DeleteResponse>;
};

export type IStorageService = {
	file: BucketOperations;
	image: BucketOperations;
	audio: BucketOperations;
};

const createBucketOperations = (
	deps: StorageDeps,
	bucket: StorageBucket,
): BucketOperations => {
	const { supabase } = deps;

	const add = async (path: string, file: File | Blob): Promise<AddResponse> => {
		const { data, error } = await supabase.storage
			.from(bucket)
			.upload(path, file, { upsert: false });

		if (error) {
			throw new Error(`Failed to add ${bucket}: ${error.message}`);
		}

		return {
			path: data.path,
			publicUrl: buildPublicUrl(supabase, bucket, data.path),
		};
	};

	const get = (path: string): GetResponse => {
		return {
			publicUrl: buildPublicUrl(supabase, bucket, path),
		};
	};

	const update = async (
		path: string,
		file: File | Blob,
	): Promise<UpdateResponse> => {
		const { data, error } = await supabase.storage
			.from(bucket)
			.upload(path, file, { upsert: true });

		if (error) {
			throw new Error(`Failed to update ${bucket}: ${error.message}`);
		}

		return {
			path: data.path,
			publicUrl: buildPublicUrl(supabase, bucket, data.path),
		};
	};

	const deleteItem = async (path: string): Promise<DeleteResponse> => {
		const { error } = await supabase.storage.from(bucket).remove([path]);

		if (error) {
			throw new Error(`Failed to delete ${bucket}: ${error.message}`);
		}

		return { isDeleted: true };
	};

	return {
		add,
		get,
		update,
		delete: deleteItem,
	};
};

export const createStorageService = (deps: StorageDeps): IStorageService => {
	const { config } = deps;

	return {
		file: createBucketOperations(deps, config.buckets.files),
		image: createBucketOperations(deps, config.buckets.images),
		audio: createBucketOperations(deps, config.buckets.audio),
	};
};
