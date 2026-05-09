import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900">Check your inbox</h2>
      <p className="text-slate-600">
        We&apos;ve sent you a verification link. Please check your email to activate your account.
      </p>
      <Link 
        href="/login" 
        className="inline-block mt-4 text-sm font-medium text-blue-600 hover:text-blue-500"
      >
        Back to login
      </Link>
    </div>
  )
}