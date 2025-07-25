import db from "./db"; // ✅ make sure this matches your path!

async function main() {
  console.log("🚀 Renaming column hotel_name to name...");

  await db.execute(`ALTER TABLE hotels RENAME COLUMN hotel_name TO name;`);

  console.log("✅ Successfully renamed hotel_name to name");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });

  