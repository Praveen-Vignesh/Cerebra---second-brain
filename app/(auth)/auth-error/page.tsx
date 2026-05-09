import Link from 'next/link'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const { message } = await searchParams

  return (
    <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-xl shadow-lg border border-red-200">
      <h2 className="text-2xl font-bold text-red-600">Authentication Error</h2>
      <p className="text-slate-600">
        {message || 'Something went wrong during the authentication process.'}
      </p>
      <Link 
        href="/login" 
        className="inline-block mt-4 px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Try again
      </Link>
    </div>
  )
}