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
  pending:  { type: "warning", text: "Your account is pending approval by a superadmin." },
  rejected: { type: "error",   text: "Your access request was not approved." },
  inactive: { type: "error",   text: "Your account has been deactivated. Contact a superadmin." },
}

const statusStyles: Record<StatusMessage["type"], string> = {
  warning: "bg-amber-50 border border-amber-200 text-amber-800",
  error:   "bg-red-50 border border-red-200 text-red-700",
  info:    "bg-blue-50 border border-blue-200 text-blue-700",
}

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
    <div className="flex min-h-full flex-col bg-white px-8 py-12 md:px-16 md:py-16">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Please enter your credentials to access the admin panel.
          </p>

          {statusMessage ? (
            <div className={`mt-4 rounded-lg px-4 py-3 text-sm ${statusStyles[statusMessage.type]}`}>
              {statusMessage.text}
            </div>
          ) : null}

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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[#1A56DB] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <LockIcon />
                </span>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error ? (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            ) : null}

            <Checkbox label="Keep me logged in" />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Signing in…" : "Sign In"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="font-medium text-[#1A56DB] hover:underline">
                Request access
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
  );
}
