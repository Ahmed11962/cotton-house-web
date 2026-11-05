import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { AdminShell } from '@/components/admin-shell';
import { Field, Check, Notice } from '@/components/admin-fields';
import { ImageUpload } from '@/components/image-upload';
import { DeleteButton } from '@/components/delete-button';
import { savePromotion, deletePromotion } from '../actions';
export default async function Promotions({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  await requireAdmin();
  const promos = await db.promotion.findMany();
  const q = await searchParams;
  return (
    <AdminShell title="Seasonal promotions">
      <Notice {...q} />
      {[null, ...promos].map((p) => (
        <details className="panel" open={!p} key={p?.id || 'new'}>
          <summary>{p?.titleEn || '+ Add promotional banner'}</summary>
          <form action={savePromotion}>
            <input type="hidden" name="id" value={p?.id || ''} />
            <div className="form-grid">
              <Field
                name="titleEn"
                label="Title · English"
                value={p?.titleEn}
                required
              />
              <Field
                name="titleAr"
                label="العنوان · العربية"
                value={p?.titleAr}
                required
              />
              <Field
                name="descriptionEn"
                label="Text · English"
                value={p?.descriptionEn}
                area
              />
              <Field
                name="descriptionAr"
                label="النص · العربية"
                value={p?.descriptionAr}
                area
              />
            </div>
            <ImageUpload
              name="image"
              single
              initial={p?.image ? [p.image] : []}
            />
            <div className="checks">
              <Check
                name="active"
                label="Show on homepage"
                checked={p?.active ?? true}
              />
              <Check
                name="demo"
                label="Demo campaign"
                checked={p?.demo ?? false}
              />
            </div>
            <button className="button navy">Save promotion</button>
          </form>
          {p && (
            <form action={deletePromotion} className="delete-form">
              <input name="id" type="hidden" value={p.id} />
              <DeleteButton />
            </form>
          )}
        </details>
      ))}
    </AdminShell>
  );
}
