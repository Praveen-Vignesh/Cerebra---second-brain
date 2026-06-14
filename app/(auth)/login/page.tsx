import AuthContainer from '@/components/auth/AuthContainer';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <AuthContainer />
    </main>
  );
}
