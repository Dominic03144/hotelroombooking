import app from "./app";
import dotenv from "dotenv";
import db from "./drizzle/db"; // Adjust if needed

dotenv.config();

// Log key environment variables for debugging
console.log("Loaded environment variables:");
console.log("PORT:", process.env.PORT);
console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

// Parse PORT
const PORT = process.env.PORT || 8080;

// Check DB connection before starting server
async function startServer() {
  try {
    console.log("Attempting to connect to the database...");
    await db.execute("SELECT 1");
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to the database:", error);
    process.exit(1);
  }
}

startServer();
