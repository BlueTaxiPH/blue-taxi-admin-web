"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SecureBadgeIcon } from "@/components/icons/secure-badge-icon"
import { requestAdminAccess } from "@/app/actions/request-admin-access"

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
      <div className="flex min-h-full flex-col items-center justify-center bg-white px-8 py-12 md:px-16 md:py-16">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-100">
            <svg className="size-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Request submitted!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A superadmin will review your account and notify you once approved.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-[#1A56DB] hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col bg-white px-8 py-12 md:px-16 md:py-16">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Request access
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit your details and a superadmin will review your request.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                  First Name <span className="text-red-500" aria-hidden>*</span>
                </label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Juan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                  Last Name <span className="text-red-500" aria-hidden>*</span>
                </label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="dela Cruz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address <span className="text-red-500" aria-hidden>*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@bluetaxi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">
                Phone Number <span className="text-red-500" aria-hidden>*</span>
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+63 917 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoComplete="tel"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password <span className="text-red-500" aria-hidden>*</span>
              </label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm Password <span className="text-red-500" aria-hidden>*</span>
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {error ? (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            ) : null}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Submitting…" : "Submit Request"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-[#1A56DB] hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="flex justify-center py-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <SecureBadgeIcon className="size-3.5 shrink-0" />
          <span>POWERED BY ARSD SECURE</span>
        </div>
      </div>
    </div>
  )
}
