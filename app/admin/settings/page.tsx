import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { AdminShell } from '@/components/admin-shell';
import { Field, Notice } from '@/components/admin-fields';
import { ImageUpload } from '@/components/image-upload';
import { saveSettings } from '../actions';
export default async function Settings({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  await requireAdmin();
  const s = await db.storeSettings.findUniqueOrThrow({
    where: { id: 'store' },
  });
  const q = await searchParams;
  return (
    <AdminShell title="Store & homepage">
      <Notice {...q} />
      <form action={saveSettings}>
        <section className="panel">
          <h2>Homepage hero</h2>
          <div className="form-grid">
            <Field
              name="heroTitleEn"
              label="Headline · English"
              value={s.heroTitleEn}
              area
              required
            />
            <Field
              name="heroTitleAr"
              label="العنوان · العربية"
              value={s.heroTitleAr}
              area
              required
            />
            <Field
              name="heroTextEn"
              label="Introduction · English"
              value={s.heroTextEn}
              area
            />
            <Field
              name="heroTextAr"
              label="المقدمة · العربية"
              value={s.heroTextAr}
              area
            />
          </div>
          <ImageUpload name="heroImage" single initial={[s.heroImage]} />
          <h2>Logo</h2>
          <ImageUpload name="logoUrl" single initial={[s.logoUrl]} />
        </section>
        <section className="panel">
          <h2>Our story</h2>
          <div className="form-grid">
            <Field
              name="aboutEn"
              label="About · English"
              value={s.aboutEn}
              area
            />
            <Field
              name="aboutAr"
              label="نبذة · العربية"
              value={s.aboutAr}
              area
            />
          </div>
        </section>
        <section className="panel">
          <h2>Visit our store</h2>
          <p className="help">
            Leave unknown details blank. In Google Maps, choose Share → Embed a
            map and paste only the iframe src URL. The directions link is
            separate.
          </p>
          <div className="form-grid">
            <Field
              name="addressEn"
              label="Address · English"
              value={s.addressEn}
              area
            />
            <Field
              name="addressAr"
              label="العنوان · العربية"
              value={s.addressAr}
              area
            />
            <Field
              name="hoursEn"
              label="Opening hours · English"
              value={s.hoursEn}
              area
            />
            <Field
              name="hoursAr"
              label="ساعات العمل · العربية"
              value={s.hoursAr}
              area
            />
            <Field
              name="directionsUrl"
              label="Google Maps directions URL"
              value={s.directionsUrl}
              type="url"
              required
            />
            <Field
              name="mapEmbedUrl"
              label="Google Maps embed URL (optional)"
              value={s.mapEmbedUrl}
            />
          </div>
        </section>
        <section className="panel">
          <h2>Contact & social</h2>
          <div className="form-grid">
            <Field
              name="whatsapp"
              label="WhatsApp (international digits, no +)"
              value={s.whatsapp}
              required
            />
            <Field name="phone" label="Display phone number" value={s.phone} />
            <Field
              name="instagram"
              label="Instagram HTTPS URL (optional)"
              value={s.instagram}
            />
            <Field
              name="snapchat"
              label="Snapchat HTTPS URL (optional)"
              value={s.snapchat}
            />
          </div>
        </section>
        <button className="button navy">Save store settings</button>
      </form>
    </AdminShell>
  );
}
