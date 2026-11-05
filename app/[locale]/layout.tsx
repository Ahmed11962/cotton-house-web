import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { localeOf } from '@/lib/catalog';
export const dynamic = 'force-dynamic';
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!['en', 'ar'].includes(raw)) notFound();
  const locale = localeOf(raw);
  const store = await db.storeSettings.findUniqueOrThrow({
    where: { id: 'store' },
  });
  return (
    <>
      <a className="skip-link" href="#main">
        {locale === 'en' ? 'Skip to content' : 'انتقل إلى المحتوى'}
      </a>
      <Header locale={locale} logo={store.logoUrl} />
      <main id="main">{children}</main>
      <Footer locale={locale} store={store} />
    </>
  );
}
