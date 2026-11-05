import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';
loadEnvConfig(process.cwd());
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  experimental: { adapter: true },
  engine: 'js',
  adapter: async () =>
    new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
