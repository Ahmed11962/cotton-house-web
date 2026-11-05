import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { AdminShell } from '@/components/admin-shell';
import { Field, Notice } from '@/components/admin-fields';
import { ImageUpload } from '@/components/image-upload';
import { DeleteButton } from '@/components/delete-button';
import { saveCategory, deleteCategory } from '../actions';
export default async function Categories({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  await requireAdmin();
  const cats = await db.category.findMany({ orderBy: { id: 'asc' } });
  const q = await searchParams;
  return (
    <AdminShell title="Categories & subcategories">
      <Notice {...q} />
      <p className="help">
        Create a category, or choose a parent to make it a subcategory. Existing
        products must be moved before deleting a category.
      </p>
      {[null, ...cats].map((c) => (
        <details className="panel" key={c?.id || 'new'} open={!c}>
          <summary>
            {c ? `${c.nameEn} · ${c.nameAr}` : '+ Add category'}
          </summary>
          <form action={saveCategory}>
            <input type="hidden" name="id" value={c?.id || ''} />
            <div className="form-grid">
              <Field
                name="nameEn"
                label="Name · English"
                value={c?.nameEn}
                required
              />
              <Field
                name="nameAr"
                label="الاسم · العربية"
                value={c?.nameAr}
                required
              />
              <Field name="slug" label="URL slug" value={c?.slug} required />
              <label className="field">
                <span>Parent category</span>
                <select name="parentId" defaultValue={c?.parentId || ''}>
                  <option value="">Top-level category</option>
                  {cats
                    .filter((x) => x.id !== c?.id)
                    .map((x) => (
                      <option value={x.id} key={x.id}>
                        {x.nameEn}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <ImageUpload
              name="image"
              single
              initial={c?.image ? [c.image] : []}
            />
            <button className="button navy">Save category</button>
          </form>
          {c && (
            <form action={deleteCategory} className="delete-form">
              <input name="id" type="hidden" value={c.id} />
              <DeleteButton />
            </form>
          )}
        </details>
      ))}
    </AdminShell>
  );
}
