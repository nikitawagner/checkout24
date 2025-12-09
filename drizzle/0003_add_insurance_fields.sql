ALTER TABLE "insurance_companies" ADD COLUMN "insurance_name" varchar(255);--> statement-breakpoint
ALTER TABLE "insurance_companies" ADD COLUMN "insurance_description" text;--> statement-breakpoint
ALTER TABLE "insurance_companies" ADD COLUMN "categories" text[];--> statement-breakpoint
ALTER TABLE "insurance_companies" ADD COLUMN "monthly_price_in_cents" integer;--> statement-breakpoint
ALTER TABLE "insurance_companies" ADD COLUMN "coverage_percentage" integer;--> statement-breakpoint
ALTER TABLE "insurance_companies" ADD COLUMN "deductible_in_cents" integer;--> statement-breakpoint
ALTER TABLE "insurance_companies" ADD COLUMN "is_active" integer DEFAULT 1 NOT NULL;
