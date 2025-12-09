import { relations } from "drizzle-orm";
import {
	integer,
	pgTable,
	real,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
	id: uuid("id").primaryKey(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	lastLoginAt: timestamp("last_login_at"),
});

export const insuranceCompaniesTable = pgTable("insurance_companies", {
	id: uuid("id").primaryKey().defaultRandom(),
	clerkUserId: text("clerk_user_id").notNull(),
	companyName: varchar("company_name", { length: 255 }).notNull(),
	insuranceName: varchar("insurance_name", { length: 255 }),
	insuranceDescription: text("insurance_description"),
	categories: text("categories").array(),
	monthlyPriceInCents: integer("monthly_price_in_cents"),
	coveragePercentage: integer("coverage_percentage"),
	deductibleInCents: integer("deductible_in_cents"),
	isActive: integer("is_active").default(1).notNull(),
	apiEndpoint: varchar("api_endpoint", { length: 512 }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const policyFilesTable = pgTable("policy_files", {
	id: uuid("id").primaryKey().defaultRandom(),
	insuranceCompanyId: uuid("insurance_company_id")
		.notNull()
		.references(() => insuranceCompaniesTable.id, { onDelete: "cascade" }),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	storageKey: varchar("storage_key", { length: 512 }).notNull(),
	storageUrl: text("storage_url").notNull(),
	fileSizeInBytes: integer("file_size_in_bytes"),
	mimeType: varchar("mime_type", { length: 128 }),
	isProcessed: integer("is_processed").default(0).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const policyEmbeddingsTable = pgTable("policy_embeddings", {
	id: uuid("id").primaryKey().defaultRandom(),
	policyFileId: uuid("policy_file_id")
		.notNull()
		.references(() => policyFilesTable.id, { onDelete: "cascade" }),
	chunkIndex: integer("chunk_index").notNull(),
	chunkText: text("chunk_text").notNull(),
	embedding: real("embedding").array().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insuranceCompaniesRelations = relations(
	insuranceCompaniesTable,
	({ many }) => ({
		policyFiles: many(policyFilesTable),
	}),
);

export const policyFilesRelations = relations(
	policyFilesTable,
	({ one, many }) => ({
		insuranceCompany: one(insuranceCompaniesTable, {
			fields: [policyFilesTable.insuranceCompanyId],
			references: [insuranceCompaniesTable.id],
		}),
		embeddings: many(policyEmbeddingsTable),
	}),
);

export const policyEmbeddingsRelations = relations(
	policyEmbeddingsTable,
	({ one }) => ({
		policyFile: one(policyFilesTable, {
			fields: [policyEmbeddingsTable.policyFileId],
			references: [policyFilesTable.id],
		}),
	}),
);
