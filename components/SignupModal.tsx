'use client'
import { useState, useTransition } from 'react';
import { signupWithEmail, signinWithGoogle } from '@/actions/auth';
import { Handlee } from 'next/font/google';


export default function SignupForm({ onToggle }: { onToggle: () => void }) {

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEmailSignup = (formData: FormData) => {
    setError(null); 
    startTransition(async () => {
      // Notice we call the SIGNUP action here
      const result = await signupWithEmail(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };


  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create an account</h2>
        <p className="mt-2 text-sm text-slate-600">Get started with Cerebra today.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm font-medium text-red-500 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <form action={handleEmailSignup} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
          <input id="email" name="email" type="email" required className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
          <input id="password" name="password" type="password" required className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2" />
        </div>
        <button type="submit" className="w-full rounded-lg bg-slate-800 px-4 py-2 text-white font-semibold hover:bg-slate-700">
          Create Account
        </button>
      </form>

      {/* Notice it calls the exact same Google action, just with different text */}
      <form action={signinWithGoogle}>
        <button className="w-full rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">
          Sign up with Google
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <button onClick={onToggle} className="font-semibold text-blue-600 hover:text-blue-500">
          Sign in
        </button>
      </p>
    </div>
  );
}