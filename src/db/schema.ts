import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
export const usersTable = pgTable("users", {
	id: uuid("id").primaryKey(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	lastLoginAt: timestamp("last_login_at"),
});
