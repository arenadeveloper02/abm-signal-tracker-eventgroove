"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm">{error.message || 'An unexpected error occurred.'}</p>
      <button type="button" className="mt-4 rounded px-4 py-2" style={{ background: '#1A73E8', color: '#FFFFFF' }} onClick={() => reset()}>
        Try again
      </button>
    </main>
  )
}
