// ✅ src/server.ts

import dotenv from "dotenv";
import app from "./app";

dotenv.config();

// Force PORT to be number
const PORT = Number(process.env.PORT) || 8080;

process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("🔥 UNHANDLED PROMISE REJECTION:", reason);
  process.exit(1);
});

console.log("✅ Starting up server...");

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
