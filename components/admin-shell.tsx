import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { logout } from '@/app/admin/actions';
import { Package, Tags, ImageIcon, Settings, ArrowUpRight } from 'lucide-react';
export async function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const admin = await requireAdmin();
  return (
    <div className="admin-shell">
      <aside>
        <Link className="admin-logo" href="/admin">
          COTTON HOUSE<small>STORE ADMINISTRATION</small>
        </Link>
        <nav>
          <Link href="/admin">
            <Package size={18} />
            Products
          </Link>
          <Link href="/admin/categories">
            <Tags size={18} />
            Categories
          </Link>
          <Link href="/admin/promotions">
            <ImageIcon size={18} aria-hidden />
            Promotions
          </Link>
          <Link href="/admin/settings">
            <Settings size={18} />
            Store & homepage
          </Link>
          <Link href="/en" target="_blank">
            View website
            <ArrowUpRight size={16} />
          </Link>
        </nav>
        <p>{admin.email}</p>
        <form action={logout}>
          <button className="button outline">Sign out</button>
        </form>
      </aside>
      <main className="admin-main">
        <div className="admin-heading">
          <p className="eyebrow">YOUR STORE, BEAUTIFULLY PRESENTED</p>
          <h1>{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
