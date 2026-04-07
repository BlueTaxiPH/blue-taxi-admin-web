import Image from "next/image"

export default async function EmailVerifiedPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const hasError = error !== undefined

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image src="/icon.png" alt="Blue Taxi" width={64} height={64} className="rounded-2xl" />
          <h1 className="text-2xl font-bold text-gray-900">Blue Taxi</h1>
        </div>

        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          {hasError ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
                <svg className="size-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Verification Failed</h2>
              <p className="text-sm text-gray-500">
                This link has expired or is invalid. Open the Blue Taxi Driver app and tap &ldquo;Resend&rdquo; to get a new verification email.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
                <svg className="size-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Thank You!</h2>
              <p className="text-sm text-gray-500">
                Your email has been confirmed successfully. Please go back to the Blue Taxi Driver app and sign in.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
