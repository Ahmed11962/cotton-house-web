import { MapPin, ArrowUpRight, Clock, MessageCircle } from 'lucide-react';
import { StoreSettings } from '@prisma/client';
import { Locale, words, localized, whatsappLink } from '@/lib/catalog';
export function Visit({
  store,
  locale,
}: {
  store: StoreSettings;
  locale: Locale;
}) {
  const t = words[locale];
  return (
    <section className="visit-section section" id="visit">
      <div className="visit-copy">
        <p className="eyebrow">
          {locale === 'en' ? 'COME ON IN' : 'أهلاً بكم'}
        </p>
        <h2>
          {locale === 'en' ? (
            <>
              A world of finds.
              <br />
              <em>Closer than you think.</em>
            </>
          ) : (
            'عالم من الاختيارات، أقرب مما تتخيل.'
          )}
        </h2>
        <p>
          {locale === 'en'
            ? 'Feel the fabrics. Find your favorites. Discover something new in person.'
            : 'المس جودة الأقمشة، واعثر على ما تحب، واكتشف الجديد بزيارتنا.'}
        </p>
        <div className="store-detail">
          <MapPin size={20} />
          <div>
            <strong>Cotton House · بيت قطن</strong>
            <p>{localized(store, 'address', locale) || t.addressUnknown}</p>
          </div>
        </div>
        <div className="store-detail">
          <Clock size={20} />
          <div>
            <strong>{t.hours}</strong>
            <p className="whitespace-pre-line">
              {localized(store, 'hours', locale) || t.hoursUnknown}
            </p>
          </div>
        </div>
        <div className="button-row">
          <a
            href={store.directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="button navy"
          >
            {t.directions}
            <ArrowUpRight size={18} />
          </a>
          <a
            href={whatsappLink(store.whatsapp, undefined, undefined, locale)}
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            <MessageCircle size={18} />
            {t.contact}
          </a>
        </div>
      </div>
      <div className="map-panel">
        {store.mapEmbedUrl ? (
          <iframe
            src={store.mapEmbedUrl}
            title={t.visit}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="map-placeholder">
            <div className="map-grid" />
            <div className="map-pin">
              <MapPin size={30} />
            </div>
            <h3>Cotton House</h3>
            <p>
              {locale === 'en'
                ? 'Your next discovery starts here.'
                : 'اكتشافك القادم يبدأ هنا.'}
            </p>
            <a href={store.directionsUrl} target="_blank" rel="noreferrer">
              {locale === 'en'
                ? 'Find us on Google Maps'
                : 'اعثر علينا في خرائط جوجل'}
              <ArrowUpRight size={16} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
