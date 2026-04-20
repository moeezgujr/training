import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables from .env file only in development
// In production, Replit provides environment variables directly
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Simplified environment schema for essential variables only
const envSchema = z
  .object({
    // Session configuration
    SESSION_SECRET: z
      .string()
      .min(32, "Session secret must be at least 32 characters"),

    // Database configuration - supports both individual params and connection URL
    DATABASE_URL: z.string().optional(),
    PGDATABASE: z.string().optional(),
    PGHOST: z.string().optional(),
    PGPORT: z.string().transform(Number).optional(),
    PGUSER: z.string().optional(),
    PGPASSWORD: z.string().optional(),
  })
  .refine(
    (data) => {
      // Require either DATABASE_URL or individual PG* parameters
      const hasDbUrl = !!data.DATABASE_URL;
      const hasIndividualParams = !!(
        data.PGDATABASE &&
        data.PGHOST &&
        data.PGUSER &&
        data.PGPASSWORD
      );

      if (!hasDbUrl && !hasIndividualParams) {
        throw new Error(
          "Either DATABASE_URL or individual PostgreSQL parameters (PGDATABASE, PGHOST, PGUSER, PGPASSWORD) must be provided"
        );
      }

      return true;
    },
    {
      message: "Database configuration is required",
    }
  );

// Parse and validate environment variables
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error("❌ Invalid environment configuration:");
  parseResult.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parseResult.data;

// Database connection helper
export const getDatabaseUrl = () => {
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }

  // Construct from individual parameters
  const { PGUSER, PGPASSWORD, PGHOST, PGPORT = 5432, PGDATABASE } = env;
  return `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}`;
};
