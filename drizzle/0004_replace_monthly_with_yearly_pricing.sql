ALTER TABLE "insurance_companies" ADD COLUMN "yearly_price_in_cents" integer;
ALTER TABLE "insurance_companies" ADD COLUMN "two_yearly_price_in_cents" integer;
ALTER TABLE "insurance_companies" DROP COLUMN IF EXISTS "monthly_price_in_cents";
