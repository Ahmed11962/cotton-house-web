import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL || 'http://localhost:3000';
  const products = await db.product.findMany({
    where: { visible: true, demo: false },
    select: { slug: true, updatedAt: true },
  });
  return ['en', 'ar'].flatMap((locale) => [
    { url: `${base}/${locale}` },
    { url: `${base}/${locale}/catalog` },
    ...products.map((p) => ({
      url: `${base}/${locale}/products/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ]);
}
