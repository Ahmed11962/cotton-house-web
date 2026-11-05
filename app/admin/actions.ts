'use server';
import { db } from '@/lib/db';
import { createSession, requireAdmin, tokenHash } from '@/lib/auth';
import { compare } from 'bcryptjs';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { productSchema, safeUrl, mapUrl } from '@/lib/validation';
import { z } from 'zod';
const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const list = (f: FormData, k: string) =>
  str(f, k)
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
const refresh = () => {
  revalidatePath('/', 'layout');
};
export async function login(form: FormData) {
  const email = str(form, 'email').toLowerCase();
  const password = String(form.get('password') ?? '');
  const h = await headers();
  const ip =
    process.env.TRUST_PROXY === '1'
      ? (h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'shared')
      : 'shared';
  const keys = [tokenHash(`email:${email}`), tokenHash(`ip:${ip}`)];
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const counts = await Promise.all(
    keys.map((key) =>
      db.loginAttempt.count({ where: { key, createdAt: { gt: since } } }),
    ),
  );
  if (counts[0] >= 8 || counts[1] >= 40) redirect('/admin/login?error=rate');
  await db.loginAttempt.createMany({ data: keys.map((key) => ({ key })) });
  await db.loginAttempt.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 86400000) } },
  });
  const admin = await db.admin.findUnique({ where: { email } });
  const valid = await compare(
    password,
    admin?.passwordHash ??
      '$2b$12$7D/pR2Kj3szis7s2mjmTi.ZO7KX9kGzHpaNz1XWYbEoKOq1yAHg2u',
  );
  if (!admin || !valid) redirect('/admin/login?error=invalid');
  await createSession(admin.id);
  redirect('/admin');
}
export async function logout() {
  const token = (await cookies()).get('ch_session')?.value;
  if (token) await db.session.deleteMany({ where: { id: tokenHash(token) } });
  (await cookies()).delete('ch_session');
  redirect('/admin/login');
}
export async function saveProduct(form: FormData) {
  await requireAdmin();
  const raw = Object.fromEntries(
    [
      'nameEn',
      'nameAr',
      'slug',
      'sku',
      'descriptionEn',
      'descriptionAr',
      'categoryId',
      'priceMode',
      'availability',
    ].map((k) => [k, str(form, k)]),
  );
  const parsed = productSchema.safeParse({
    ...raw,
    price: str(form, 'price') === '' ? null : Number(str(form, 'price')),
    sizes: list(form, 'sizes'),
    colors: list(form, 'colors'),
    images: str(form, 'images').split('\n').filter(Boolean),
    ...Object.fromEntries(
      ['featured', 'newArrival', 'visible', 'demo'].map((k) => [
        k,
        form.get(k) === 'on',
      ]),
    ),
  });
  const id = str(form, 'id');
  if (!parsed.success)
    redirect(`/admin/products/${id || 'new'}?error=validation`);
  try {
    if (id) await db.product.update({ where: { id }, data: parsed.data });
    else await db.product.create({ data: parsed.data });
  } catch {
    redirect(`/admin/products/${id || 'new'}?error=save`);
  }
  refresh();
  redirect('/admin?saved=1');
}
export async function deleteProduct(form: FormData) {
  await requireAdmin();
  await db.product.delete({ where: { id: str(form, 'id') } });
  refresh();
  redirect('/admin');
}
export async function saveCategory(form: FormData) {
  await requireAdmin();
  const id = str(form, 'id');
  const parentId = str(form, 'parentId') || null;
  const data = z
    .object({
      nameEn: z.string().min(1).max(180),
      nameAr: z.string().min(1).max(180),
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      image: safeUrl,
      parentId: z.string().nullable(),
    })
    .safeParse({
      ...Object.fromEntries(
        ['nameEn', 'nameAr', 'slug', 'image'].map((k) => [k, str(form, k)]),
      ),
      parentId,
    });
  if (!data.success) redirect('/admin/categories?error=validation');
  if (parentId) {
    let cursor: string | null = parentId;
    const seen = new Set<string>();
    while (cursor) {
      if (cursor === id || seen.has(cursor))
        redirect('/admin/categories?error=cycle');
      seen.add(cursor);
      const p: { parentId: string | null } | null =
        await db.category.findUnique({
          where: { id: cursor },
          select: { parentId: true },
        });
      cursor = p?.parentId ?? null;
    }
  }
  try {
    if (id) await db.category.update({ where: { id }, data: data.data });
    else await db.category.create({ data: data.data });
  } catch {
    redirect('/admin/categories?error=save');
  }
  refresh();
  redirect('/admin/categories?saved=1');
}
export async function deleteCategory(form: FormData) {
  await requireAdmin();
  try {
    await db.category.delete({ where: { id: str(form, 'id') } });
  } catch {
    redirect('/admin/categories?error=inuse');
  }
  refresh();
  redirect('/admin/categories');
}
export async function savePromotion(form: FormData) {
  await requireAdmin();
  const id = str(form, 'id');
  const p = z
    .object({
      titleEn: z.string().min(1).max(200),
      titleAr: z.string().min(1).max(200),
      descriptionEn: z.string().max(2000),
      descriptionAr: z.string().max(2000),
      image: safeUrl,
      active: z.boolean(),
      demo: z.boolean(),
    })
    .safeParse({
      ...Object.fromEntries(
        ['titleEn', 'titleAr', 'descriptionEn', 'descriptionAr', 'image'].map(
          (k) => [k, str(form, k)],
        ),
      ),
      active: form.get('active') === 'on',
      demo: form.get('demo') === 'on',
    });
  if (!p.success) redirect('/admin/promotions?error=validation');
  if (id) await db.promotion.update({ where: { id }, data: p.data });
  else await db.promotion.create({ data: p.data });
  refresh();
  redirect('/admin/promotions?saved=1');
}
export async function deletePromotion(form: FormData) {
  await requireAdmin();
  await db.promotion.delete({ where: { id: str(form, 'id') } });
  refresh();
  redirect('/admin/promotions');
}
export async function saveSettings(form: FormData) {
  await requireAdmin();
  const schema = z.object({
    heroTitleEn: z.string().min(1).max(200),
    heroTitleAr: z.string().min(1).max(200),
    heroTextEn: z.string().max(2000),
    heroTextAr: z.string().max(2000),
    heroImage: safeUrl,
    aboutEn: z.string().max(10000),
    aboutAr: z.string().max(10000),
    addressEn: z.string().max(1000),
    addressAr: z.string().max(1000),
    hoursEn: z.string().max(2000),
    hoursAr: z.string().max(2000),
    whatsapp: z.string().regex(/^\d{8,15}$/),
    phone: z.string().max(30),
    directionsUrl: z.url().refine((s) => s.startsWith('https://')),
    mapEmbedUrl: mapUrl,
    instagram: z.union([
      z.literal(''),
      z.url().refine((s) => s.startsWith('https://')),
    ]),
    snapchat: z.union([
      z.literal(''),
      z.url().refine((s) => s.startsWith('https://')),
    ]),
    logoUrl: safeUrl,
  });
  const p = schema.safeParse(
    Object.fromEntries(Object.keys(schema.shape).map((k) => [k, str(form, k)])),
  );
  if (!p.success) redirect('/admin/settings?error=validation');
  await db.storeSettings.update({ where: { id: 'store' }, data: p.data });
  refresh();
  redirect('/admin/settings?saved=1');
}
