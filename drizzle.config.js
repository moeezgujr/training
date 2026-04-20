// drizzle.config.js (Note: Renamed to .js, but .ts might still work if you have a ts-node setup)

// 1. Use require() for dotenv and path
const { config } = require("dotenv");
const path = require("path");

// --- START DEBUG LOGGING ---
const envPath = path.resolve(__dirname, "temp.env");
console.log(`[DEBUG] Attempting to load .env from: ${envPath}`);

// Load the environment variables
const result = config({ path: envPath });

if (result.error) {
  console.error(`[DEBUG] dotenv FAILED to load: ${result.error.message}`);
} else {
  // If successful, this will list the keys it found (e.g., DATABASE_URL)
  console.log(`[DEBUG] dotenv loaded keys: ${Object.keys(result.parsed || {}).join(', ')}`);
}

// 2. Validate the variable immediately after loading it.
const databaseUrl = process.env.DATABASE_URL;

console.log(`[DEBUG] Value of DATABASE_URL: ${databaseUrl ? '✅ Loaded (Value hidden for security)' : '❌ UNDEFINED/Empty'}`);

if (!databaseUrl) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}
// --- END DEBUG LOGGING ---

// 3. Export the configuration object using module.exports
// We don't need defineConfig here since we're not using TypeScript types for the export
module.exports = {
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
};