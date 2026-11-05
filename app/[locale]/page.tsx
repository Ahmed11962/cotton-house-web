import Link from 'next/link';
import { Photo } from '@/components/photo';
import {
  ArrowUpRight,
  ArrowRight,
  Flower2,
  Shirt,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { db } from '@/lib/db';
import { localeOf, localized, words } from '@/lib/catalog';
import { ProductCard } from '@/components/catalog';
import { Visit } from '@/components/visit';
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = localeOf((await params).locale),
    ar = locale === 'ar',
    t = words[locale];
  const [store, categories, featured, arrivals, promos] = await Promise.all([
    db.storeSettings.findUniqueOrThrow({ where: { id: 'store' } }),
    db.category.findMany({ where: { parentId: null }, orderBy: { id: 'asc' } }),
    db.product.findMany({
      where: { visible: true, featured: true },
      include: { category: true },
      take: 4,
      orderBy: { createdAt: 'desc' },
    }),
    db.product.findMany({
      where: { visible: true, newArrival: true },
      include: { category: true },
      take: 4,
      orderBy: { createdAt: 'desc' },
    }),
    db.promotion.findMany({ where: { active: true }, take: 3 }),
  ]);
  return (
    <>
      <section className="hero">
        <img
          className="hero-photo"
          src={store.heroImage}
          alt={
            ar
              ? 'صورة تحريرية تجريبية للأقمشة والأزياء'
              : 'Illustrative editorial photograph of clothing and everyday essentials'
          }
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow">
            <span />{' '}
            {ar
              ? 'بيت قطن · لكل تفاصيل الحياة'
              : 'COTTON HOUSE · FOR EVERY PART OF YOUR DAY'}
          </p>
          <h1>{localized(store, 'heroTitle', locale)}</h1>
          <p className="hero-description">
            {localized(store, 'heroText', locale)}
          </p>
          <Link href={`/${locale}/catalog`} className="button navy">
            {t.discover}
            <ArrowUpRight size={19} />
          </Link>
          <a href="#visit" className="hero-visit">
            <MapPin size={15} />
            {ar ? 'اكتشف أكثر في متجرنا' : 'There’s more to discover in store'}
          </a>
        </div>
        <div className="hero-foot">
          <span>COTTON HOUSE</span>
          <span>
            {ar
              ? 'ملابس · عطور · وأكثر'
              : 'CLOTHING · FRAGRANCE · EVERYDAY FINDS'}
          </span>
          <span>{ar ? 'صور توضيحية' : 'EDITORIAL DEMO'}</span>
        </div>
      </section>
      <div className="brand-strip">
        <span>
          <Flower2 />
          {ar ? 'اختيارات لكل يوم' : 'Thoughtful everyday finds'}
        </span>
        <span>
          <Shirt />
          {ar ? 'شيء لكل فرد' : 'Something for everyone'}
        </span>
        <span>
          <MapPin />
          {ar ? 'اكتشف في المتجر' : 'Discover it in store'}
        </span>
      </div>
      <section className="section categories-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              {ar ? 'عالم من الاختيارات' : 'A WORLD OF POSSIBILITIES'}
            </p>
            <h2>
              {ar ? (
                'اعثر على ما تحب.'
              ) : (
                <>
                  Find your <em>everyday.</em>
                </>
              )}
            </h2>
          </div>
          <Link className="text-link" href={`/${locale}/catalog`}>
            {ar ? 'تصفح جميع الفئات' : 'Explore all categories'}
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              className={`category-card category-${i}`}
              href={`/${locale}/catalog?category=${c.slug}`}
            >
              <Photo src={c.image || '/images/placeholder.svg'} alt="" />
              <div>
                <span>{localized(c, 'name', locale)}</span>
                <ArrowUpRight size={19} />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="section featured-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              {ar
                ? 'مختارات تستحق الاكتشاف'
                : 'CONSIDERED. COLLECTED. CURATED.'}
            </p>
            <h2>
              {ar ? (
                'مختاراتنا لك.'
              ) : (
                <>
                  Good things, <em>picked for you.</em>
                </>
              )}
            </h2>
          </div>
          <Link className="text-link" href={`/${locale}/catalog?featured=1`}>
            {ar ? 'عرض المختارات' : 'View featured collection'}
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="product-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} locale={locale} />
          ))}
        </div>
        {featured.some((p) => p.demo) && (
          <p className="demo-disclaimer">{t.demoNote}</p>
        )}
      </section>
      <section className="story-banner" id="about">
        <div className="story-art">
          <img
            src="/images/story.jpg"
            alt={
              ar
                ? 'صورة توضيحية لأقمشة قطنية'
                : 'Illustrative cotton fabric editorial'
            }
            loading="lazy"
          />
          <span>
            COTTON
            <br />
            HOUSE.
          </span>
        </div>
        <div className="story-copy">
          <p className="eyebrow">
            {ar
              ? 'أهلاً بكم في بيت قطن'
              : 'MORE THAN A STORE. A LITTLE INSPIRATION.'}
          </p>
          <h2>
            {ar ? (
              'للحياة بكل تفاصيلها.'
            ) : (
              <>
                For life.
                <br />
                And everything <em>in it.</em>
              </>
            )}
          </h2>
          <p>{localized(store, 'about', locale)}</p>
          <a className="text-link" href="#visit">
            {t.visit}
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              {ar ? 'اكتشاف جديد في كل زيارة' : 'FRESH FINDS, NEW FAVORITES'}
            </p>
            <h2>
              {ar ? (
                'الجديد في بيت قطن.'
              ) : (
                <>
                  Just <em>arrived.</em>
                </>
              )}
            </h2>
          </div>
          <Link className="text-link" href={`/${locale}/catalog?new=1`}>
            {ar ? 'كل ما وصل حديثاً' : 'All new arrivals'}
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="product-grid">
          {arrivals.map((p) => (
            <ProductCard key={p.id} product={p} locale={locale} />
          ))}
        </div>
      </section>
      {promos.map((p) => (
        <section
          className="promotion"
          key={p.id}
          style={
            p.image
              ? {
                  backgroundImage: `linear-gradient(90deg,rgba(17,42,36,.95),rgba(17,42,36,.7)),url("${p.image.replace(/["\\]/g, '')}")`,
                }
              : undefined
          }
        >
          <Sparkles size={28} />
          <div>
            <p className="eyebrow">
              {p.demo
                ? ar
                  ? 'عرض تجريبي · لا يوجد خصم فعلي'
                  : 'DEMO CAMPAIGN · NO ACTIVE DISCOUNT'
                : ar
                  ? 'اكتشف هذا الموسم'
                  : 'THIS SEASON AT COTTON HOUSE'}
            </p>
            <h2>{localized(p, 'title', locale)}</h2>
            <p>{localized(p, 'description', locale)}</p>
          </div>
          <Link className="button light" href={`/${locale}/catalog`}>
            {t.discover}
            <ArrowUpRight size={18} />
          </Link>
        </section>
      ))}
      <Visit store={store} locale={locale} />
    </>
  );
}
