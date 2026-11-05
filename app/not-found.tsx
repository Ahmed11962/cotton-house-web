import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="empty-state">
      <p className="eyebrow">COTTON HOUSE</p>
      <h1>Page not found · الصفحة غير موجودة</h1>
      <p>This page may have moved or is no longer available.</p>
      <Link href="/en/catalog" className="button navy">
        Explore the collection
      </Link>
    </main>
  );
}
