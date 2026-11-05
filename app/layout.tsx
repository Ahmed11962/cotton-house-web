import './globals.css';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
  title: { default: 'Cotton House | بيت قطن', template: '%s | Cotton House' },
  description:
    'Discover clothing, shoes, perfumes and more at Cotton House, Saudi Arabia. Explore our catalog and visit our store.',
  icons: { icon: '/brand/icon.svg' },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await headers()).get('x-locale') === 'ar' ? 'ar' : 'en';
  return (
    <html
      data-scroll-behavior="smooth"
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <body>{children}</body>
    </html>
  );
}
