import { loadEnvConfig } from '@next/env';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';
loadEnvConfig(process.cwd());
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (
    !email ||
    !email.includes('@') ||
    !password ||
    password.length < 12 ||
    Buffer.byteLength(password) > 72
  )
    throw new Error(
      'Set ADMIN_EMAIL and ADMIN_PASSWORD (12–72 bytes) in your private environment.',
    );
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    await db.admin.create({
      data: { email, passwordHash: await hash(password, 12) },
    });
    console.log('Admin created. Credentials were not printed.');
  } finally {
    await db.$disconnect();
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
