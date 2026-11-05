'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="empty-state">
      <h1>We couldn’t load this page.</h1>
      <p>تعذر تحميل الصفحة. يرجى المحاولة مرة أخرى.</p>
      <button className="button navy" onClick={reset}>
        Try again · حاول مجدداً
      </button>
    </main>
  );
}
