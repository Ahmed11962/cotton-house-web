import { loadEnvConfig } from '@next/env';
import { Client } from 'pg';
import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
loadEnvConfig(process.cwd());
async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('SELECT pg_advisory_lock(714129625)');
    await client.query(
      'CREATE TABLE IF NOT EXISTS cotton_migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())',
    );
    const dirs = (await readdir('prisma/migrations', { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const dir of dirs) {
      const sql = await readFile(
        `prisma/migrations/${dir.name}/migration.sql`,
        'utf8',
      );
      const checksum = createHash('sha256').update(sql).digest('hex');
      const prior = await client.query(
        'SELECT checksum FROM cotton_migrations WHERE name=$1',
        [dir.name],
      );
      if (prior.rowCount) {
        if (prior.rows[0].checksum !== checksum)
          throw new Error(`Applied migration changed: ${dir.name}`);
        continue;
      }
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO cotton_migrations(name,checksum) VALUES ($1,$2)',
          [dir.name, checksum],
        );
        await client.query('COMMIT');
        console.log(`Applied ${dir.name}`);
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      }
    }
    console.log('Database migrations are current.');
  } finally {
    await client.query('SELECT pg_advisory_unlock(714129625)').catch(() => {});
    await client.end();
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
