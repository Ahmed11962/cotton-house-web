import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHash, randomBytes } from 'node:crypto';
import { db } from './db';
export const tokenHash = (s: string) =>
  createHash('sha256').update(s).digest('hex');
export async function getAdmin() {
  const token = (await cookies()).get('ch_session')?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { id: tokenHash(token) },
    include: { admin: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.admin;
}
export async function requireAdmin() {
  const a = await getAdmin();
  if (!a) redirect('/admin/login');
  return a;
}
export async function createSession(adminId: string) {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + 8 * 60 * 60 * 1000);
  await db.session.create({
    data: { id: tokenHash(token), adminId, expiresAt: expires },
  });
  (await cookies()).set('ch_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires,
  });
}
