import Link from 'next/link';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { db } from '@/lib/db';
import { localeOf, localized, words } from '@/lib/catalog';
import { ProductCard } from '@/components/catalog';
import type { Prisma } from '@prisma/client';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return {
    title: (await params).locale === 'ar' ? 'تشكيلتنا' : 'Our collection',
  };
}
export default async function Catalog({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const locale = localeOf((await params).locale),
    ar = locale === 'ar',
    t = words[locale],
    q = await searchParams;
  const categories = await db.category.findMany({ orderBy: { id: 'asc' } });
  const selected = categories.find((c) => c.slug === q.category);
  const categoryIds = selected ? [selected.id] : [];
  for (let i = 0; i < categoryIds.length; i++)
    for (const c of categories)
      if (c.parentId === categoryIds[i] && !categoryIds.includes(c.id))
        categoryIds.push(c.id);
  const where: Prisma.ProductWhereInput = {
    visible: true,
    ...(selected ? { categoryId: { in: categoryIds } } : {}),
    ...(q.featured === '1' ? { featured: true } : {}),
    ...(q.new === '1' ? { newArrival: true } : {}),
    ...(q.q
      ? {
          OR: ['nameEn', 'nameAr', 'sku', 'descriptionEn', 'descriptionAr'].map(
            (k) => ({
              [k]: { contains: q.q!.slice(0, 200), mode: 'insensitive' },
            }),
          ),
        }
      : {}),
  };
  const page = Math.max(1, Math.min(10000, Number(q.page) || 1));
  const total = await db.product.count({ where });
  const products = await db.product.findMany({
    where,
    include: { category: true },
    orderBy: q.sort === 'name' ? { nameEn: 'asc' } : { createdAt: 'desc' },
    take: 12,
    skip: (page - 1) * 12,
  });
  return (
    <div className="section catalog-page">
      <p className="breadcrumb">
        <Link href={`/${locale}`}>{t.home}</Link> / {t.collection}
      </p>
      <div className="catalog-heading">
        <div>
          <p className="eyebrow">
            {ar ? 'اكتشف ما يناسبك' : 'SOMETHING THAT FEELS LIKE YOU'}
          </p>
          <h1>
            {selected ? (
              localized(selected, 'name', locale)
            ) : ar ? (
              'اكتشافات لكل يوم.'
            ) : (
              <>
                Everyday <em>discoveries.</em>
              </>
            )}
          </h1>
        </div>
        <p>
          {ar
            ? 'تصفح عبر الموقع. اكتشف في المتجر.'
            : 'Browse at your pace. Discover it in store.'}
        </p>
      </div>
      <form className="catalog-search" action={`/${locale}/catalog`}>
        <Search size={20} />
        <input
          name="q"
          defaultValue={q.q}
          placeholder={t.search}
          aria-label={t.search}
        />
        {q.category && (
          <input type="hidden" name="category" value={q.category} />
        )}
        <select
          name="sort"
          defaultValue={q.sort || 'recent'}
          aria-label={ar ? 'ترتيب' : 'Sort products'}
        >
          <option value="recent">{ar ? 'الأحدث أولاً' : 'Newest first'}</option>
          <option value="name">{ar ? 'الاسم' : 'Name A–Z'}</option>
        </select>
        <button className="button navy">{ar ? 'بحث' : 'Search'}</button>
      </form>
      <div className="catalog-layout">
        <aside className="category-sidebar">
          <h2>
            <SlidersHorizontal size={16} />
            {t.filter}
          </h2>
          <Link
            className={!selected ? 'selected' : ''}
            href={`/${locale}/catalog`}
          >
            {t.all}
          </Link>
          {categories.map((c) => (
            <Link
              className={`${c.id === selected?.id ? 'selected' : ''} ${c.parentId ? 'subcategory' : ''}`}
              key={c.id}
              href={`/${locale}/catalog?category=${c.slug}`}
            >
              {localized(c, 'name', locale)}
            </Link>
          ))}
        </aside>
        <div>
          <div className="results-bar">
            <span>
              {total} {ar ? 'منتج' : 'discoveries'}
            </span>
            {(q.q || q.featured || q.new) && (
              <Link className="text-link" href={`/${locale}/catalog`}>
                {ar ? 'مسح الفلاتر' : 'Clear filters'}
                <X size={14} />
              </Link>
            )}
          </div>
          <div className="product-grid catalog-products">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
          {!products.length && <p className="empty-state">{t.empty}</p>}
          <nav
            className="pagination"
            aria-label={ar ? 'صفحات المنتجات' : 'Catalog pages'}
          >
            {Array.from({ length: Math.ceil(total / 12) }, (_, i) => i + 1)
              .filter((n) => Math.abs(n - page) < 3)
              .map((n) => (
                <Link
                  key={n}
                  aria-current={n === page ? 'page' : undefined}
                  href={`/${locale}/catalog?${new URLSearchParams({ ...Object.fromEntries(Object.entries(q).filter((entry): entry is [string, string] => typeof entry[1] === 'string')), page: String(n) })}`}
                >
                  {n}
                </Link>
              ))}
          </nav>
          {products.some((p) => p.demo) && (
            <p className="demo-disclaimer">{t.demoNote}</p>
          )}
        </div>
      </div>
    </div>
  );
}
