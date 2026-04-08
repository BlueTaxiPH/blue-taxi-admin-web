"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SecureBadgeIcon } from "@/components/icons/secure-badge-icon"
import { requestAdminAccess } from "@/app/actions/request-admin-access"

const cssVars = {
  "--background": "#050B18",
  "--foreground": "#E8EEFF",
  "--card": "#0C1529",
  "--input": "rgba(255,255,255,0.07)",
  "--border": "rgba(255,255,255,0.12)",
  "--primary": "#1A56DB",
  "--primary-foreground": "#ffffff",
  "--muted-foreground": "#5B7BA8",
  "--ring": "rgba(59,130,246,0.4)",
} as React.CSSProperties

export function SignUpForm() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const result = await requestAdminAccess({
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
    })

    if (!result.success) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div
        className="flex min-h-full flex-col items-center justify-center px-8 py-12 md:px-16 md:py-16"
        style={{ background: "#070D1E", ...cssVars }}
      >
        <div className="auth-animate-in w-full max-w-sm text-center">
          <div
            className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full"
            style={{
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.3)",
              boxShadow: "0 0 20px rgba(16,185,129,0.2)",
            }}
          >
            <svg
              className="size-7 text-emerald-400"
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
          <h2
            className="text-2xl font-bold text-[#E8EEFF]"
            style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
          >
            Request submitted!
          </h2>
          <p className="mt-2 text-sm text-[#5B7BA8]">
            A superadmin will review your account and notify you once approved.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-[#3B82F6] transition-colors hover:text-blue-400"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-full flex-col px-8 py-12 md:px-14 md:py-16"
      style={{ background: "#070D1E", ...cssVars }}
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="auth-animate-in w-full max-w-sm">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5B7BA8]">
            Join the team
          </p>
          <h2
            className="text-3xl font-bold text-[#E8EEFF]"
            style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
          >
            Request access
          </h2>
          <p className="mt-1 text-sm text-[#5B7BA8]">
            Submit your details and a superadmin will review your request.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="text-sm font-medium text-[#A8C0D8]"
                >
                  First Name <span className="text-red-400" aria-hidden>*</span>
                </label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Juan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                  className="transition-shadow focus:shadow-[0_0_0_1px_#1A56DB,0_0_12px_rgba(26,86,219,0.25)]"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="lastName"
                  className="text-sm font-medium text-[#A8C0D8]"
                >
                  Last Name <span className="text-red-400" aria-hidden>*</span>
                </label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="dela Cruz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                  className="transition-shadow focus:shadow-[0_0_0_1px_#1A56DB,0_0_12px_rgba(26,86,219,0.25)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="su-email"
                className="text-sm font-medium text-[#A8C0D8]"
              >
                Email Address <span className="text-red-400" aria-hidden>*</span>
              </label>
              <Input
                id="su-email"
                type="email"
                placeholder="you@bluetaxi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="transition-shadow focus:shadow-[0_0_0_1px_#1A56DB,0_0_12px_rgba(26,86,219,0.25)]"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-[#A8C0D8]"
              >
                Phone Number <span className="text-red-400" aria-hidden>*</span>
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+63 917 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoComplete="tel"
                className="transition-shadow focus:shadow-[0_0_0_1px_#1A56DB,0_0_12px_rgba(26,86,219,0.25)]"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="su-password"
                className="text-sm font-medium text-[#A8C0D8]"
              >
                Password <span className="text-red-400" aria-hidden>*</span>
              </label>
              <Input
                id="su-password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="transition-shadow focus:shadow-[0_0_0_1px_#1A56DB,0_0_12px_rgba(26,86,219,0.25)]"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-[#A8C0D8]"
              >
                Confirm Password <span className="text-red-400" aria-hidden>*</span>
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="transition-shadow focus:shadow-[0_0_0_1px_#1A56DB,0_0_12px_rgba(26,86,219,0.25)]"
              />
            </div>

            {error ? (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                <span className="mt-0.5 shrink-0 text-sm text-red-400">⚠</span>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(26,86,219,0.4)]"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Submitting…
                </span>
              ) : (
                "Submit Request"
              )}
            </Button>

            <p className="text-center text-sm text-[#5B7BA8]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-[#3B82F6] transition-colors hover:text-blue-400"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="flex justify-center py-4">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#2d4a6a]">
          <SecureBadgeIcon className="size-3.5 shrink-0" />
          <span>Powered by ARSD Secure</span>
        </div>
      </div>
    </div>
  )
}
