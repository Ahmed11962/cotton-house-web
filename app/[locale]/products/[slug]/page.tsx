import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import {
  localeOf,
  localized,
  words,
  priceLabel,
  whatsappLink,
} from '@/lib/catalog';
import { ProductCard } from '@/components/catalog';
import { Gallery } from '@/components/gallery';
import { MessageCircle, MapPin, ArrowUpRight } from 'lucide-react';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const p = await db.product.findFirst({ where: { slug, visible: true } });
  if (!p) return { title: 'Product not found' };
  return {
    title: localized(p, 'name', localeOf(locale)),
    description: localized(p, 'description', localeOf(locale)).slice(0, 160),
    alternates: {
      languages: { en: `/en/products/${slug}`, ar: `/ar/products/${slug}` },
    },
    ...(p.demo ? { robots: { index: false, follow: true } } : {}),
  };
}
export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = localeOf(raw),
    ar = locale === 'ar',
    t = words[locale];
  const p = await db.product.findFirst({
    where: { slug, visible: true },
    include: { category: true },
  });
  if (!p) notFound();
  const [store, similar] = await Promise.all([
    db.storeSettings.findUniqueOrThrow({ where: { id: 'store' } }),
    db.product.findMany({
      where: { visible: true, categoryId: p.categoryId, id: { not: p.id } },
      include: { category: true },
      take: 4,
    }),
  ]);
  return (
    <div className="section product-page">
      <p className="breadcrumb">
        <Link href={`/${locale}`}>{t.home}</Link> /{' '}
        <Link href={`/${locale}/catalog`}>{t.catalog}</Link> /{' '}
        {localized(p, 'name', locale)}
      </p>
      <div className="product-detail">
        <Gallery images={p.images} name={localized(p, 'name', locale)} />
        <div className="product-info">
          <p className="eyebrow">{localized(p.category, 'name', locale)}</p>
          {p.demo && <span className="badge">{t.demo}</span>}
          <h1>{localized(p, 'name', locale)}</h1>
          <p className="product-sku">SKU: {p.sku}</p>
          <p className="detail-price">
            {priceLabel(
              p.price === null ? null : Number(p.price),
              p.priceMode,
              locale,
            )}
          </p>
          <p className="product-description">
            {localized(p, 'description', locale)}
          </p>
          <p className="availability">
            ●{' '}
            {p.availability === 'AVAILABLE'
              ? t.available
              : p.availability === 'UNAVAILABLE'
                ? t.unavailable
                : t.askAvailability}
          </p>
          {p.sizes.length > 0 && (
            <div className="product-options">
              <h2>{t.sizes}</h2>
              {p.sizes.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          )}
          {p.colors.length > 0 && (
            <div className="product-options">
              <h2>{t.colors}</h2>
              {p.colors.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          )}
          <a
            className="button green wide"
            target="_blank"
            rel="noreferrer"
            href={whatsappLink(
              store.whatsapp,
              localized(p, 'name', locale),
              p.sku,
              locale,
            )}
          >
            <MessageCircle size={20} />
            {t.inquire}
            <ArrowUpRight size={18} />
          </a>
          <Link className="button outline wide" href={`/${locale}#visit`}>
            <MapPin size={18} />
            {t.visit}
          </Link>
          {p.demo && <p className="demo-disclaimer">{t.demoNote}</p>}
        </div>
      </div>
      <div className="section-heading">
        <h2>{t.similar}</h2>
        <Link
          className="text-link"
          href={`/${locale}/catalog?category=${p.category.slug}`}
        >
          {ar ? 'تصفح المنتجات المشابهة' : 'Browse similar products'}
          <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="product-grid">
        {similar.map((item) => (
          <ProductCard key={item.id} product={item} locale={locale} />
        ))}
      </div>
      {!similar.length && (
        <p>
          {ar
            ? 'استكشف المزيد من التشكيلة عبر الفئة.'
            : 'Explore more from this category in our catalog.'}
        </p>
      )}
    </div>
  );
}
