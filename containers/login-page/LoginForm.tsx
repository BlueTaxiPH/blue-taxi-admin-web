"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { EnvelopeIcon } from "@/components/icons/envelope-icon"
import { LockIcon } from "@/components/icons/lock-icon"
import { SecureBadgeIcon } from "@/components/icons/secure-badge-icon"

export function LoginForm() {
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push("/dashboard")
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
                placeholder="password123"
                className="pl-10"
              />
            </div>
          </div>

          <Checkbox label="Keep me logged in" />

          <Button type="submit" className="w-full" size="lg">
            Sign In
          </Button>
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
