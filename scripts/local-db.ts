import EmbeddedPostgres from 'embedded-postgres';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
async function main() {
  mkdirSync('.local', { recursive: true });
  const credentialFile = '.local/db-password';
  if (!existsSync(credentialFile))
    writeFileSync(credentialFile, randomBytes(24).toString('hex'), {
      mode: 0o600,
    });
  const password = readFileSync(credentialFile, 'utf8');
  const pg = new EmbeddedPostgres({
    databaseDir: '.local/postgres',
    user: 'cotton',
    password,
    port: 5433,
    persistent: true,
    authMethod: 'scram-sha-256',
    postgresFlags: ['-h', '127.0.0.1'],
    onLog: () => {},
    onError: () => {},
  });
  if (!existsSync('.local/postgres/PG_VERSION')) await pg.initialise();
  await pg.start();
  const client = pg.getPgClient();
  await client.connect();
  const r = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = 'cotton_house'",
  );
  if (!r.rowCount) await pg.createDatabase('cotton_house');
  await client.end();
  if (!existsSync('.env'))
    writeFileSync(
      '.env',
      `DATABASE_URL="postgresql://cotton:${password}@127.0.0.1:5433/cotton_house"\nAPP_URL="http://localhost:3000"\nUPLOAD_DIR="./uploads"\n`,
      { mode: 0o600 },
    );
  console.log(
    'Local PostgreSQL ready on 127.0.0.1:5433. Existing .env preserved.',
  );
  for (const signal of ['SIGINT', 'SIGTERM'] as const)
    process.on(signal, async () => {
      await pg.stop();
      process.exit(0);
    });
  setInterval(() => {}, 60_000);
}
main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
