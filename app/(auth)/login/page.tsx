import AuthContainer from '@/components/AuthContainer';

export default function LoginPage() {
  return (
    // We use a full-screen flexbox to perfectly center the AuthContainer
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 sm:p-8">

      <AuthContainer />
      
    </main>
  );
}