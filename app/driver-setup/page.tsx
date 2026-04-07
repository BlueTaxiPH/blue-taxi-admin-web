"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

type PageState = "loading" | "ready" | "success" | "expired"

export default function DriverSetupPage() {
  const [pageState, setPageState] = useState<PageState>("loading")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    void (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setPageState("ready")
        return
      }

      // Hash token may still be exchanging — listen for the state change
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session) {
            setPageState("ready")
            subscription.unsubscribe()
          }
        }
      )

      // If no auth event fires within 6 seconds, the link is expired or invalid
      const timer = setTimeout(() => {
        setPageState("expired")
        subscription.unsubscribe()
      }, 6000)

      return () => {
        clearTimeout(timer)
        subscription.unsubscribe()
      }
    })()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setIsSubmitting(false)
      return
    }

    // Sign out after password is set — driver uses the mobile app, not this web
    await supabase.auth.signOut()
    setPageState("success")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image src="/icon.png" alt="Blue Taxi" width={64} height={64} className="rounded-2xl" />
          <h1 className="text-2xl font-bold text-gray-900">Blue Taxi</h1>
          <p className="text-sm text-gray-500">Driver Account Setup</p>
        </div>

        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          {pageState === "loading" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Verifying your invite link…</p>
            </div>
          )}

          {pageState === "expired" && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
                <svg className="size-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Link expired</h2>
              <p className="text-sm text-gray-500">
                This link has expired or is invalid. Contact your administrator to resend the invite.
              </p>
            </div>
          )}

          {pageState === "ready" && (
            <>
              <h2 className="mb-1 text-xl font-semibold text-gray-900">Activate Your Account</h2>
              <p className="mb-6 text-sm text-gray-500">
                Set a password to complete your account setup. You&apos;ll use this to sign in to the Blue Taxi Driver app.
              </p>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-900">
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
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-900">
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
                  <p className="text-sm font-medium text-red-600">{error}</p>
                ) : null}

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Activating…" : "Set Password & Activate"}
                </Button>
              </form>
            </>
          )}

          {pageState === "success" && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
                <svg className="size-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Account activated!</h2>
              <p className="text-sm text-gray-500">
                Sign in to the Blue Taxi Driver app using your email and the password you just set.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
