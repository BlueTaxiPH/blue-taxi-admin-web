"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EnvelopeIcon } from "@/components/icons/envelope-icon";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/containers/auth-layout";

const formCssVars = {
  "--border": "rgba(255,255,255,0.1)",
  "--input": "rgba(255,255,255,0.04)",
  "--foreground": "#E8EEFF",
  "--ring": "rgba(59,130,246,0.4)",
  "--primary": "#1A56DB",
  "--primary-foreground": "#fff",
} as React.CSSProperties

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      }
    );

    setIsLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSubmitted(true);
  }

  return (
    <AuthShell>
      {submitted ? (
        <div className="auth-animate-in flex flex-col items-center gap-4 py-4 text-center">
          <div
            className="flex size-14 items-center justify-center rounded-full"
            style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              boxShadow: "0 0 20px rgba(16,185,129,0.2)",
            }}
          >
            <EnvelopeIcon className="size-6 text-emerald-400" />
          </div>
          <div>
            <h2
              className="text-xl font-bold text-[#E8EEFF]"
              style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
            >
              Check your email
            </h2>
            <p className="mt-2 text-sm text-[#5B7BA8]">
              We sent a reset link to{" "}
              <span className="font-medium text-[#A8C0D8]">{email}</span>.
            </p>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-[#3B82F6] transition-colors hover:text-blue-400"
          >
            ← Back to Sign In
          </Link>
        </div>
      ) : (
        <>
          <h2
            className="mb-1 text-2xl font-bold text-[#E8EEFF]"
            style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
          >
            Forgot password?
          </h2>
          <p className="mb-6 text-sm text-[#5B7BA8]">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          <form
            className="space-y-5"
            onSubmit={handleSubmit}
            style={formCssVars}
          >
            <div className="space-y-2">
              <label
                htmlFor="fp-email"
                className="text-sm font-medium text-[#A8C0D8]"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5B7BA8]">
                  <EnvelopeIcon />
                </span>
                <Input
                  id="fp-email"
                  type="email"
                  placeholder="admin@bluetaxi.com"
                  className="pl-10 transition-shadow focus:shadow-[0_0_0_1px_#1A56DB,0_0_12px_rgba(26,86,219,0.25)]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : null}

            <Button
              type="submit"
              className="w-full hover:shadow-[0_0_20px_rgba(26,86,219,0.4)]"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending…
                </span>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#5B7BA8]">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-medium text-[#3B82F6] transition-colors hover:text-blue-400"
            >
              Back to Sign In
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
