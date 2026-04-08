"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { EnvelopeIcon } from "@/components/icons/envelope-icon";
import { LockIcon } from "@/components/icons/lock-icon";
import { SecureBadgeIcon } from "@/components/icons/secure-badge-icon";
import { createClient } from "@/lib/supabase/client";

type StatusMessage = {
  type: "warning" | "error" | "info"
  text: string
}

const urlStatusMessages: Record<string, StatusMessage> = {
  pending: { type: "warning", text: "Your account is pending approval by a superadmin." },
  rejected: { type: "error", text: "Your access request was not approved." },
  inactive: { type: "error", text: "Your account has been deactivated. Contact a superadmin." },
}

const statusStyles: Record<StatusMessage["type"], string> = {
  warning: "bg-amber-500/10 border-amber-500/25 text-amber-300",
  error: "bg-red-500/10 border-red-500/25 text-red-400",
  info: "bg-blue-500/10 border-blue-500/25 text-blue-300",
}

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

export function LoginForm({ initialStatus }: { initialStatus?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(
    initialStatus ? (urlStatusMessages[initialStatus] ?? null) : null
  );
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);
    setIsLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    // Check admin_status before proceeding to dashboard
    const { data: profile } = await supabase
      .from("users")
      .select("admin_status, is_active")
      .eq("email", email)
      .single();

    if (profile?.admin_status === "pending") {
      await supabase.auth.signOut();
      setStatusMessage({ type: "warning", text: "Your account is pending approval by a superadmin." });
      setIsLoading(false);
      return;
    }

    if (profile?.admin_status === "rejected") {
      await supabase.auth.signOut();
      setStatusMessage({ type: "error", text: "Your access request was not approved." });
      setIsLoading(false);
      return;
    }

    if (profile?.is_active === false) {
      await supabase.auth.signOut();
      setStatusMessage({ type: "error", text: "Your account has been deactivated. Contact a superadmin." });
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div
      className="flex min-h-full flex-col px-8 py-12 md:px-14 md:py-16"
      style={{ background: "#070D1E", ...cssVars }}
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="auth-animate-in w-full max-w-sm">
          {/* Heading */}
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5B7BA8]">
            Welcome back
          </p>
          <h2
            className="text-3xl font-bold text-[#E8EEFF]"
            style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
          >
            Sign In
          </h2>
          <p className="mt-1 text-sm text-[#5B7BA8]">
            Enter your credentials to access the admin panel.
          </p>

          {/* Status message */}
          {statusMessage ? (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${statusStyles[statusMessage.type]}`}
            >
              {statusMessage.text}
            </div>
          ) : null}

          {/* Form */}
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="auth-animate-in auth-animate-in-delay-1 space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#A8C0D8]"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5B7BA8]">
                  <EnvelopeIcon />
                </span>
                <Input
                  id="email"
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

            <div className="auth-animate-in auth-animate-in-delay-2 space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#A8C0D8]"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[#3B82F6] transition-colors hover:text-blue-400"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5B7BA8]">
                  <LockIcon />
                </span>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 transition-shadow focus:shadow-[0_0_0_1px_#1A56DB,0_0_12px_rgba(26,86,219,0.25)]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error ? (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                <span className="mt-0.5 shrink-0 text-sm text-red-400">⚠</span>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ) : null}

            <Checkbox id="keep-me-logged-in" label="Keep me logged in" />

            <Button
              type="submit"
              className="auth-animate-in auth-animate-in-delay-3 w-full transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(26,86,219,0.4)]"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </Button>

            <p className="text-center text-sm text-[#5B7BA8]">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-[#3B82F6] transition-colors hover:text-blue-400"
              >
                Request access
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="flex justify-center py-4">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#2d4a6a]">
          <SecureBadgeIcon className="size-3.5 shrink-0" />
          <span>Powered by Sentralian Software Services</span>
        </div>
      </div>
    </div>
  );
}
