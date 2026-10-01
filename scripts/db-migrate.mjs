import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDir, "..");

function loadLocalEnv() {
  const envPath = join(projectRoot, ".env.local");
  if (!existsSync(envPath)) {
    return;
  }
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }
    const separator = trimmed.indexOf("=");
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function splitStatements(script) {
  return script
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

async function main() {
  loadLocalEnv();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set. Export it or add it to .env.local.");
  }
  const sql = neon(databaseUrl);
  const migrationsDir = join(projectRoot, "db", "migrations");
  const migrationFiles = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  let applied = 0;
  for (const file of migrationFiles) {
    const migration = readFileSync(join(migrationsDir, file), "utf8");
    const statements = splitStatements(migration);
    for (const statement of statements) {
      await sql.query(statement);
    }
    applied += statements.length;
    console.log(`Applied ${file} (${statements.length} statements).`);
  }
  console.log(`Applied ${applied} migration statements total.`);

  const tables = await sql.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads'",
  );
  if (tables.length !== 1) {
    throw new Error("Verification failed: public.leads was not found after migration.");
  }
  console.log("Verified: table public.leads exists.");

  const columns = await sql.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' ORDER BY ordinal_position",
  );
  console.log(`Verified: public.leads has ${columns.length} columns.`);
  for (const column of columns) {
    console.log(`- ${column.column_name}: ${column.data_type}`);
  }

  const [{ count }] = await sql.query("SELECT COUNT(*)::int AS count FROM leads");
  console.log(`Verified: SELECT COUNT(*) FROM leads returned ${count}.`);
}

main().catch((error) => {
  console.error(`Migration failed: ${error.message}`);
  process.exit(1);
});
