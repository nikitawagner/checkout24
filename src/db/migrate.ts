import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./index";

const main = async () => {
	try {
		await migrate(db, {
			migrationsFolder: "./src/db/migrations",
		});
		console.log("✅ Migrations completed successfully");
		process.exit(0);
	} catch (error) {
		console.error("❌ Migration failed:", error);
		process.exit(1);
	}
};

main();
