"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EnvelopeIcon } from "@/components/icons/envelope-icon";
import { SecureBadgeIcon } from "@/components/icons/secure-badge-icon";
import { createClient } from "@/lib/supabase/client";

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
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    setIsLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSubmitted(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-white px-8 py-12 md:px-16 md:py-16">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-sm">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-100">
                <EnvelopeIcon className="size-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Check your email
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a password reset link to{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Follow the link in the email to reset your password.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block text-sm font-medium text-[#1A56DB] hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Forgot password?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your email address and we&apos;ll send you a link to reset
                your password.
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <EnvelopeIcon />
                    </span>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@bluetaxi.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {error ? (
                  <p className="text-sm font-medium text-red-600">{error}</p>
                ) : null}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending…" : "Send Reset Link"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-medium text-[#1A56DB] hover:underline"
                >
                  Back to Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-center py-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <SecureBadgeIcon className="size-3.5 shrink-0" />
          <span>POWERED BY ARSD SECURE</span>
        </div>
      </div>
    </div>
  );
}
