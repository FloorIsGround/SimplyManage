import "dotenv/config";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name} in env.`);
  }
  return value;
}

function parsePort(raw: string): number {
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error(`Invalid DB_PORT "${raw}". Expected integer 1-65535.`);
  }
  return parsed;
}

function stripPsqlMetaCommands(sql: string): string {
  return sql
    .split(/\r?\n/)
    .filter((line) => !line.trimStart().startsWith("\\"))
    .join("\n");
}

function stripExtensionStatements(sql: string): string {
  return sql
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      return !(
        /^CREATE EXTENSION\b/i.test(trimmed) ||
        /^COMMENT ON EXTENSION\b/i.test(trimmed)
      );
    })
    .join("\n");
}

const DROP_PUBLIC_TABLES_AND_SEQUENCES_SQL = `
DO $$
DECLARE
  obj RECORD;
BEGIN
  FOR obj IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I.%I CASCADE', obj.schemaname, obj.tablename);
  END LOOP;

  FOR obj IN
    SELECT sequence_schema, sequence_name
    FROM information_schema.sequences
    WHERE sequence_schema = 'public'
  LOOP
    EXECUTE format('DROP SEQUENCE IF EXISTS %I.%I CASCADE', obj.sequence_schema, obj.sequence_name);
  END LOOP;
END $$;
`;

async function runSchema({ dropFirst }: { dropFirst: boolean }): Promise<void> {
  const dbHost = requireEnv("DB_HOST");
  const dbPort = parsePort(requireEnv("DB_PORT"));
  const dbUser = requireEnv("DB_USER");
  const dbPassword = requireEnv("DB_PASSWORD");
  const dbName = requireEnv("DB_NAME");
  const sslEnabled = String(process.env.DB_SSL?.trim() || "").toLowerCase() === "true";

  const sqlPath = fileURLToPath(new URL("./schema.sql", import.meta.url));
  const sql = await fs.readFile(sqlPath, "utf8");
  const cleanedSql = stripExtensionStatements(stripPsqlMetaCommands(sql));

  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    if (dropFirst) {
      await client.query(DROP_PUBLIC_TABLES_AND_SEQUENCES_SQL);
    }
    await client.query(cleanedSql);
  } finally {
    await client.end().catch(() => undefined);
  }
}

function printUsageAndExit() {
  console.log("Usage: node manage-schema.js [--reset|--update]\n  --reset: Drop all tables and re-apply schema (DANGEROUS, destructive)\n  --update: Apply schema.sql without dropping tables (default)");
  process.exit(1);
}

// Determine mode from command-line args
const arg = process.argv[2]?.toLowerCase();
let dropFirst: boolean = false;
if (!arg || arg === "--update") {
  dropFirst = false;
} else if (arg === "--reset") {
  dropFirst = true;
} else {
  printUsageAndExit();
}

runSchema({ dropFirst }).catch((err) => {
  console.error("Error running manage-schema:");
  console.error(err);
  process.exit(1);
});
