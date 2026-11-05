'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ArrowUpRight, Search } from 'lucide-react';
import { Locale, words } from '@/lib/catalog';
export function Header({ locale, logo }: { locale: Locale; logo: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = words[locale];
  const alternate = pathname.replace(
    /^\/(en|ar)/,
    locale === 'en' ? '/ar' : '/en',
  );
  return (
    <>
      <div className="announcement">
        {locale === 'en'
          ? 'Everyday discoveries. One welcoming place.'
          : 'اكتشافات لكل يوم. في مكان يجمعنا.'}
        <span>
          {locale === 'en'
            ? 'Visit us in Saudi Arabia'
            : 'زورونا في المملكة العربية السعودية'}
        </span>
      </div>
      <header className="site-header">
        <Link
          href={`/${locale}`}
          className="brand"
          aria-label="Cotton House home"
        >
          <img src={logo} alt="Cotton House — بيت قطن" width="70" height="80" />
          <span>
            COTTON HOUSE
            <small>
              {locale === 'en'
                ? 'A LITTLE OF EVERYTHING YOU LOVE'
                : 'كل ما تحب في مكان واحد'}
            </small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href={`/${locale}/catalog`}>{t.catalog}</Link>
          <Link href={`/${locale}#about`}>{t.about}</Link>
          <Link href={`/${locale}#visit`}>
            {t.visit}
            <ArrowUpRight size={14} />
          </Link>
        </nav>
        <div className="header-actions">
          <Link href={`/${locale}/catalog`} aria-label={t.search}>
            <Search size={19} />
          </Link>
          <a
            className="language"
            href={alternate}
            lang={locale === 'en' ? 'ar' : 'en'}
          >
            {locale === 'en' ? 'العربية' : 'English'}
          </a>
          <button
            className="mobile-toggle"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={locale === 'en' ? 'Toggle menu' : 'فتح القائمة'}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {open && (
        <nav
          className="mobile-menu"
          id="mobile-menu"
          aria-label="Mobile navigation"
          onClick={() => setOpen(false)}
        >
          <Link href={`/${locale}/catalog`}>{t.catalog}</Link>
          <Link href={`/${locale}#about`}>{t.about}</Link>
          <Link href={`/${locale}#visit`}>{t.visit}</Link>
        </nav>
      )}
    </>
  );
}
