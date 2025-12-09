ALTER TABLE "insurance_companies" DROP CONSTRAINT "insurance_companies_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "insurance_companies" RENAME COLUMN "user_id" TO "clerk_user_id";
--> statement-breakpoint
ALTER TABLE "insurance_companies" ALTER COLUMN "clerk_user_id" SET DATA TYPE text;
