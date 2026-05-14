'use client'
import { useState, useTransition } from 'react';
import { signupWithEmail, signinWithGoogle } from '@/actions/auth';

export default function SignupForm({ onToggle }: { onToggle: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEmailSignup = (formData: FormData) => {
    setError(null); 
    startTransition(async () => {
      // Notice we call SIGNUP action here
      const result = await signupWithEmail(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Create an account</h2>
        <p className="mt-2 text-sm text-muted-foreground">Get started with Cerebra today.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm font-medium text-red-500 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      <form action={handleEmailSignup} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground">Email address</label>
          <input 
            id="email" 
            name="email" 
            type="email" 
            required 
            className="mt-1 block w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" 
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground">Password</label>
          <input 
            id="password" 
            name="password" 
            type="password" 
            required 
            className="mt-1 block w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" 
          />
        </div>
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full rounded-lg bg-accent px-4 py-2 text-accent-foreground font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      {/* Notice it calls exact same Google action, just with different text */}
      <form action={signinWithGoogle}>
        <button className="w-full rounded-lg border border-border bg-card text-card-foreground px-4 py-2 font-semibold hover:bg-card/80 transition-colors">
          Sign up with Google
        </button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <button type="button" onClick={onToggle} className="font-semibold text-accent hover:text-accent/80 transition-colors">
          Sign in
        </button>
      </div>
    </div>
  );
}