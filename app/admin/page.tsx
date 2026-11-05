import Link from 'next/link';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { AdminShell } from '@/components/admin-shell';
import { Notice } from '@/components/admin-fields';
export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; saved?: string }>;
}) {
  await requireAdmin();
  const q = await searchParams;
  const products = await db.product.findMany({
    where: q.q
      ? {
          OR: [
            { nameEn: { contains: q.q, mode: 'insensitive' } },
            { sku: { contains: q.q, mode: 'insensitive' } },
          ],
        }
      : {},
    include: { category: true },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  });
  const [count, hidden, demos] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { visible: false } }),
    db.product.count({ where: { demo: true } }),
  ]);
  return (
    <AdminShell title="Your product catalog">
      <Notice saved={q.saved} />
      <div className="stats">
        <div>
          <span>Total products</span>
          <strong>{count}</strong>
        </div>
        <div>
          <span>Hidden products</span>
          <strong>{hidden}</strong>
        </div>
        <div>
          <span>Demo products</span>
          <strong>{demos}</strong>
        </div>
      </div>
      <div className="admin-toolbar">
        <form>
          <input
            name="q"
            defaultValue={q.q}
            placeholder="Search name or SKU"
            aria-label="Search products"
          />
          <button className="button outline">Search</button>
        </form>
        <Link href="/admin/products/new" className="button navy">
          + Add product
        </Link>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price display</th>
              <th>Visibility</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.nameEn}</strong>
                  <small>
                    {p.sku} {p.demo ? '· DEMO' : ''}
                  </small>
                </td>
                <td>{p.category.nameEn}</td>
                <td>
                  {p.priceMode === 'SHOW' ? `${p.price} SAR` : p.priceMode}
                </td>
                <td>{p.visible ? 'Published' : 'Hidden'}</td>
                <td>
                  <Link className="text-link" href={`/admin/products/${p.id}`}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!products.length && (
        <p className="empty-state">No products yet. Add your first product.</p>
      )}
      <p className="help">
        Showing up to 100 recently edited products. Search by name or SKU to
        find older products.
      </p>
    </AdminShell>
  );
}
