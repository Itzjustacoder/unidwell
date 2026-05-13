import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="text-6xl mb-4">🏠</div>
      <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Page not found</h1>
      <p className="text-slate-400 mb-8">This page doesn't exist or you don't have access.</p>
      <Link
        href="/explore"
        className="bg-gradient-brand text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition-opacity"
      >
        Back to Explore
      </Link>
    </div>
  )
}
