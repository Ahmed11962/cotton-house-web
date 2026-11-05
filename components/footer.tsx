import Link from 'next/link';
import { StoreSettings } from '@prisma/client';
import { Locale, words, whatsappLink } from '@/lib/catalog';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
export function Footer({
  locale,
  store,
}: {
  locale: Locale;
  store: StoreSettings;
}) {
  const t = words[locale];
  return (
    <>
      <footer>
        <div className="footer-top">
          <div>
            <span className="footer-wordmark">
              COTTON HOUSE<span>بيت قطن</span>
            </span>
            <p>
              {locale === 'en'
                ? 'Everyday essentials. Unexpected finds.'
                : 'أساسيات يومية واكتشافات مميزة.'}
            </p>
          </div>
          <div>
            <h3>{locale === 'en' ? 'Explore' : 'اكتشف'}</h3>
            <Link href={`/${locale}/catalog`}>{t.catalog}</Link>
            <Link href={`/${locale}#about`}>{t.about}</Link>
            <Link href={`/${locale}#visit`}>{t.visit}</Link>
          </div>
          <div>
            <h3>{locale === 'en' ? 'Say hello' : 'تواصل معنا'}</h3>
            <a href={`tel:+${store.whatsapp}`} dir="ltr">
              {store.phone}
            </a>
            <a
              href={whatsappLink(store.whatsapp, undefined, undefined, locale)}
            >
              WhatsApp <ArrowUpRight size={14} />
            </a>
            {store.instagram && (
              <a href={store.instagram}>
                Instagram <ArrowUpRight size={14} />
              </a>
            )}
            {store.snapchat && (
              <a href={store.snapchat}>
                Snapchat <ArrowUpRight size={14} />
              </a>
            )}
          </div>
          <div className="footer-note">
            <p>
              {locale === 'en'
                ? 'Discover online. Experience in store.'
                : 'اكتشف عبر الموقع، واستمتع بالتجربة في المتجر.'}
            </p>
            <span>
              {locale === 'en'
                ? 'Our catalog is your invitation to visit.'
                : 'تشكيلتنا دعوة لزيارتنا.'}
            </span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Cotton House · بيت قطن</span>
          <span>
            {locale === 'en'
              ? 'Made for everyday living.'
              : 'لكل تفاصيل الحياة.'}
          </span>
        </div>
      </footer>
      <a
        className="floating-whatsapp"
        href={whatsappLink(store.whatsapp, undefined, undefined, locale)}
        aria-label={t.contact}
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle size={24} />
      </a>
    </>
  );
}
