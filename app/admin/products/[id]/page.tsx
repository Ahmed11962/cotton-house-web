import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { AdminShell } from '@/components/admin-shell';
import { Field, Check, Notice } from '@/components/admin-fields';
import { ImageUpload } from '@/components/image-upload';
import { DeleteButton } from '@/components/delete-button';
import { saveProduct, deleteProduct } from '../../actions';
export default async function Edit({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const p =
    id === 'new' ? null : await db.product.findUnique({ where: { id } });
  if (id !== 'new' && !p) notFound();
  const cats = await db.category.findMany({ orderBy: { nameEn: 'asc' } });
  const { error } = await searchParams;
  return (
    <AdminShell title={p ? 'Edit product' : 'Add a product'}>
      <Notice error={error} />
      <form action={saveProduct} className="admin-form">
        <input type="hidden" name="id" value={p?.id || ''} />
        <section className="panel">
          <h2>Product details</h2>
          <div className="form-grid">
            <Field
              name="nameEn"
              label="Name · English"
              value={p?.nameEn}
              required
            />
            <Field
              name="nameAr"
              label="الاسم · العربية"
              value={p?.nameAr}
              required
            />
            <Field
              name="slug"
              label="URL slug (e.g. cotton-shirt)"
              value={p?.slug}
              required
            />
            <Field
              name="sku"
              label="SKU / product code"
              value={p?.sku}
              required
            />
            <Field
              name="descriptionEn"
              label="Description · English"
              value={p?.descriptionEn}
              area
            />
            <Field
              name="descriptionAr"
              label="الوصف · العربية"
              value={p?.descriptionAr}
              area
            />
          </div>
          <label className="field">
            <span>Category</span>
            <select name="categoryId" defaultValue={p?.categoryId} required>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameEn} / {c.nameAr}
                </option>
              ))}
            </select>
          </label>
        </section>
        <section className="panel">
          <h2>Photography</h2>
          <ImageUpload initial={p?.images} />
        </section>
        <section className="panel">
          <h2>Price & options</h2>
          <div className="form-grid">
            <Field
              name="price"
              label="Price in SAR (optional)"
              type="number"
              value={p?.price?.toString()}
            />
            <label className="field">
              <span>Price visibility</span>
              <select name="priceMode" defaultValue={p?.priceMode || 'INQUIRE'}>
                <option value="INQUIRE">Inquire for price</option>
                <option value="SHOW">Show price</option>
                <option value="HIDDEN">Hide price entirely</option>
              </select>
            </label>
            <Field
              name="sizes"
              label="Sizes (comma separated)"
              value={p?.sizes.join(', ')}
            />
            <Field
              name="colors"
              label="Colors (comma separated; bilingual labels welcome)"
              value={p?.colors.join(', ')}
            />
            <label className="field">
              <span>Availability</span>
              <select
                name="availability"
                defaultValue={p?.availability || 'INQUIRE'}
              >
                <option value="INQUIRE">Ask about availability</option>
                <option value="AVAILABLE">Available in store</option>
                <option value="UNAVAILABLE">Currently unavailable</option>
              </select>
            </label>
          </div>
        </section>
        <section className="panel">
          <h2>Display settings</h2>
          <div className="checks">
            <Check
              name="visible"
              label="Visible on website"
              checked={p?.visible ?? true}
            />
            <Check
              name="featured"
              label="Featured collection"
              checked={p?.featured}
            />
            <Check
              name="newArrival"
              label="New arrival"
              checked={p?.newArrival}
            />
            <Check
              name="demo"
              label="Demo content (clearly labeled)"
              checked={p?.demo}
            />
          </div>
        </section>
        <button className="button navy">Save product</button>
      </form>
      {p && (
        <form action={deleteProduct} className="delete-form">
          <input name="id" type="hidden" value={p.id} />
          <DeleteButton />
        </form>
      )}
    </AdminShell>
  );
}
