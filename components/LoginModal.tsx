'use client'

import { useTransition, useState } from 'react';
import { loginWithEmail, signinWithGoogle } from '@/actions/auth';

export default function LoginForm({ onToggle }: { onToggle: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEmailLogin = (formData: FormData) => {
    setError(null); 
    startTransition(async () => {
      const result = await loginWithEmail(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-600">Enter your details to access your dashboard.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm font-medium text-red-500 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <form action={handleEmailLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
          <input id="email" name="email" type="email" required className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
          <input id="password" name="password" type="password" required className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2" />
        </div>
        <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-500">
          Sign in
        </button>
      </form>

      <form action={signinWithGoogle}>
        <button className="w-full rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">
          Sign in with Google
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <button onClick={onToggle} className="font-semibold text-blue-600 hover:text-blue-500">
          Sign up
        </button>
      </p>
    </div>
  );
}