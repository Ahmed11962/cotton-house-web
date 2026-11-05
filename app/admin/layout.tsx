import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Store administration',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
