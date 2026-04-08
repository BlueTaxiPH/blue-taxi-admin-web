import { AuthShell } from "@/containers/auth-layout"

export default async function EmailVerifiedPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const hasError = error !== undefined

  return (
    <AuthShell>
      {hasError ? (
        <div className="auth-animate-in flex flex-col items-center gap-4 py-4 text-center">
          <div
            className="flex size-14 items-center justify-center rounded-full"
            style={{
              background: "rgba(248,113,113,0.12)",
              border: "1px solid rgba(248,113,113,0.25)",
              boxShadow: "0 0 20px rgba(248,113,113,0.15)",
            }}
          >
            <svg
              className="size-6 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div>
            <h2
              className="text-xl font-bold text-[#E8EEFF]"
              style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
            >
              Verification Failed
            </h2>
            <p className="mt-2 text-sm text-[#5B7BA8]">
              This link has expired or is invalid. Open the Blue Taxi Driver app
              and tap &ldquo;Resend&rdquo; to get a new verification email.
            </p>
          </div>
        </div>
      ) : (
        <div className="auth-animate-in flex flex-col items-center gap-4 py-4 text-center">
          <div
            className="flex size-14 items-center justify-center rounded-full"
            style={{
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.25)",
              boxShadow: "0 0 20px rgba(16,185,129,0.15)",
            }}
          >
            <svg
              className="size-6 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h2
              className="text-xl font-bold text-[#E8EEFF]"
              style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
            >
              Email Verified!
            </h2>
            <p className="mt-2 text-sm text-[#5B7BA8]">
              Your email has been confirmed. Go back to the Blue Taxi Driver app
              and sign in.
            </p>
          </div>
        </div>
      )}
    </AuthShell>
  )
}
