import Link from 'next/link';
import { login } from '../actions';
import { getAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Field } from '@/components/admin-fields';
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getAdmin()) redirect('/admin');
  const { error } = await searchParams;
  return (
    <main className="login-page">
      <form action={login} className="login-card">
        <img
          src="/brand/logo.svg"
          alt="Cotton House"
          width="100"
          height="120"
        />
        <p className="eyebrow">COTTON HOUSE ADMINISTRATION</p>
        <h1>Welcome back.</h1>
        <p>Sign in to manage your store catalog.</p>
        {error && (
          <p role="alert" className="notice error">
            {error === 'rate'
              ? 'Too many attempts. Try again in 15 minutes.'
              : 'Email or password is incorrect.'}
          </p>
        )}
        <Field name="email" type="email" label="Email address" required />
        <Field name="password" type="password" label="Password" required />
        <button className="button navy wide">Sign in</button>
        <Link href="/en" className="text-link">
          Return to website
        </Link>
      </form>
    </main>
  );
}
