CREATE TABLE "insurance_companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"api_endpoint" varchar(512) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policy_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_file_id" uuid NOT NULL,
	"chunk_index" integer NOT NULL,
	"chunk_text" text NOT NULL,
	"embedding" real[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policy_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"insurance_company_id" uuid NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"storage_key" varchar(512) NOT NULL,
	"storage_url" text NOT NULL,
	"file_size_in_bytes" integer,
	"mime_type" varchar(128),
	"is_processed" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "insurance_companies" ADD CONSTRAINT "insurance_companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_embeddings" ADD CONSTRAINT "policy_embeddings_policy_file_id_policy_files_id_fk" FOREIGN KEY ("policy_file_id") REFERENCES "public"."policy_files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_files" ADD CONSTRAINT "policy_files_insurance_company_id_insurance_companies_id_fk" FOREIGN KEY ("insurance_company_id") REFERENCES "public"."insurance_companies"("id") ON DELETE cascade ON UPDATE no action;