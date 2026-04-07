"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { AuthShell } from "@/containers/auth-layout"

type PageState = "loading" | "ready" | "success" | "expired"

const formCssVars = {
  "--border": "rgba(255,255,255,0.1)",
  "--input": "rgba(255,255,255,0.04)",
  "--foreground": "#E8EEFF",
  "--ring": "rgba(59,130,246,0.4)",
  "--primary": "#1A56DB",
  "--primary-foreground": "#fff",
} as React.CSSProperties

function getPasswordStrength(pwd: string): {
  score: 0 | 1 | 2 | 3
  label: string
  color: string
} {
  if (pwd.length === 0) return { score: 0, label: "", color: "" }
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/\d/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++
  const labels = ["", "Weak", "Fair", "Strong"] as const
  const colors = ["", "#F87171", "#FBBF24", "#10B981"] as const
  return {
    score: score as 0 | 1 | 2 | 3,
    label: labels[score],
    color: colors[score],
  }
}

export default function UpdatePasswordPage() {
  const [pageState, setPageState] = useState<PageState>("loading")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const strength = getPasswordStrength(password)

  useEffect(() => {
    const supabase = createClient()

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setPageState("ready")
        return
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setPageState("ready")
          subscription.unsubscribe()
        }
      })

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

    setPageState("success")
  }

  return (
    <AuthShell>
      {pageState === "loading" && (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="size-8 animate-spin rounded-full border-2 border-white/10 border-t-blue-400" />
          <p className="text-sm text-[#5B7BA8]">Verifying your reset link…</p>
        </div>
      )}

      {pageState === "expired" && (
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
              Link expired
            </h2>
            <p className="mt-2 text-sm text-[#5B7BA8]">
              This link has expired or has already been used. Request a new one.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[#3B82F6] transition-colors hover:text-blue-400"
          >
            Request new link
          </Link>
        </div>
      )}

      {pageState === "ready" && (
        <div className="auth-animate-in" style={formCssVars}>
          <h2
            className="mb-1 text-2xl font-bold text-[#E8EEFF]"
            style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
          >
            Reset Your Password
          </h2>
          <p className="mb-6 text-sm text-[#5B7BA8]">
            Enter a new password for your account.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="new-password"
                className="text-sm font-medium text-[#A8C0D8]"
              >
                New Password{" "}
                <span className="text-red-400" aria-hidden>
                  *
                </span>
              </label>
              <Input
                id="new-password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="transition-shadow focus:shadow-[0_0_0_1px_#1A56DB,0_0_12px_rgba(26,86,219,0.25)]"
              />
              {password.length > 0 ? (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background:
                            i <= strength.score
                              ? strength.color
                              : "rgba(255,255,255,0.08)",
                        }}
                      />
                    ))}
                  </div>
                  {strength.label ? (
                    <p
                      className="text-xs"
                      style={{ color: strength.color }}
                    >
                      {strength.label}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="text-sm font-medium text-[#A8C0D8]"
              >
                Confirm Password{" "}
                <span className="text-red-400" aria-hidden>
                  *
                </span>
              </label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Re-enter your new password"
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
              className="w-full hover:shadow-[0_0_20px_rgba(26,86,219,0.4)]"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Updating…
                </span>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </div>
      )}

      {pageState === "success" && (
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
              Password updated!
            </h2>
            <p className="mt-2 text-sm text-[#5B7BA8]">
              You can now sign in with your new password.
            </p>
          </div>
        </div>
      )}
    </AuthShell>
  )
}
