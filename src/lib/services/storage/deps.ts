import type { SupabaseClient } from "@supabase/supabase-js";
import type { StorageConfig } from "./config";

export type StorageDeps = {
	supabase: SupabaseClient;
	config: StorageConfig;
};
