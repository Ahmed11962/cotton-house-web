import Link from 'next/link';
import { Photo } from './photo';
import type { Product, Category } from '@prisma/client';
import { ArrowUpRight } from 'lucide-react';
import { Locale, localized, priceLabel, words } from '@/lib/catalog';
export function ProductCard({
  product: p,
  locale,
}: {
  product: Product & { category: Category };
  locale: Locale;
}) {
  const t = words[locale];
  return (
    <article className="product-card">
      <Link className="product-image" href={`/${locale}/products/${p.slug}`}>
        <Photo
          src={p.images[0] || '/images/placeholder.svg'}
          alt={localized(p, 'name', locale)}
        />
        <div className="badges">
          {p.demo && <span className="badge">{t.demo}</span>}
          {p.newArrival && <span className="badge green">{t.new}</span>}
        </div>
        <span className="product-view">
          {t.view}
          <ArrowUpRight size={18} />
        </span>
      </Link>
      <div className="product-meta">
        <span>{localized(p.category, 'name', locale)}</span>
        <span>
          {p.colors.length > 0
            ? `${p.colors.length} ${locale === 'en' ? 'colors' : 'ألوان'}`
            : ''}
        </span>
      </div>
      <Link href={`/${locale}/products/${p.slug}`}>
        <h3>{localized(p, 'name', locale)}</h3>
      </Link>
      <p className="price">
        {priceLabel(
          p.price === null ? null : Number(p.price),
          p.priceMode,
          locale,
        )}
      </p>
    </article>
  );
}
