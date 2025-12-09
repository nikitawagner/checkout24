import type { SupabaseClient } from "@supabase/supabase-js";
import type { StorageBucket } from "./types";

export const buildPublicUrl = (
	supabase: SupabaseClient,
	bucket: StorageBucket,
	path: string,
): string => {
	const { data } = supabase.storage.from(bucket).getPublicUrl(path);

	return data.publicUrl;
};
