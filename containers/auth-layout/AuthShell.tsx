import Image from "next/image"
import { SecureBadgeIcon } from "@/components/icons/secure-badge-icon"

interface AuthShellProps {
  children: React.ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: "#020817" }}
    >
      {/* Ambient glow behind content */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 40% at 50% 35%, rgba(26,86,219,0.07) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            "linear-gradient(rgba(59,130,246,0.025) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(59,130,246,0.025) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "64px 64px",
        }}
        aria-hidden
      />

      <div
        className="relative z-10 w-full max-w-sm"
        style={
          {
            "--background": "#020817",
            "--foreground": "#E8EEFF",
            "--input": "rgba(255,255,255,0.06)",
            "--border": "rgba(255,255,255,0.1)",
            "--primary": "#1A56DB",
            "--primary-foreground": "#ffffff",
            "--muted-foreground": "#4B6B8A",
            "--ring": "rgba(59,130,246,0.4)",
          } as React.CSSProperties
        }
      >
        {/* Brand mark */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div
            className="flex size-12 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(26,86,219,0.15)",
              border: "1px solid rgba(59,130,246,0.22)",
              boxShadow: "0 0 20px rgba(26,86,219,0.15)",
            }}
          >
            <Image
              src="/icon.png"
              alt="Blue Taxi"
              width={28}
              height={28}
              className="rounded-xl"
            />
          </div>
          <div className="text-center">
            <p
              className="text-sm font-bold uppercase tracking-[0.22em] text-white"
              style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
            >
              Blue Taxi
            </p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/25">
              Admin Dashboard
            </p>
          </div>
        </div>

        {/* Page content */}
        <div>{children}</div>

        {/* Separator */}
        <div
          className="my-8"
          style={{ height: "1px", background: "rgba(255,255,255,0.05)" }}
        />

        {/* Footer */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1.5 text-[11px] text-white/18">
            <SecureBadgeIcon className="size-3 shrink-0" />
            <span className="uppercase tracking-widest">
              Powered by ARSD Secure
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
