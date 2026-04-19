import Link from "next/link"

const LEGAL_LINKS: Array<{ label: string; href: string }> = [
  { label: "Privacy", href: "#privacy" },
  { label: "Terms", href: "#terms" },
  { label: "Status", href: "#status" },
]

export function LandingFooter() {
  return (
    <footer className="relative border-t border-white/[0.05] px-4 pb-12 pt-10 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <span className="relative flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1A56DB]">
            <span
              className="absolute inset-0 rounded-full opacity-50 blur-md"
              style={{ background: "radial-gradient(circle, #3B82F6, transparent 70%)" }}
              aria-hidden
            />
            <span
              className="relative text-[11px] font-semibold text-white"
              style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
            >
              b
            </span>
          </span>
          <div>
            <p
              className="text-sm font-semibold tracking-tight text-white"
              style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
            >
              Blue Taxi
            </p>
            <p className="text-[11px] text-white/40">Operator platform &middot; Philippines</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[12px] text-white/45 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <span className="font-mono text-[11px] text-white/30">
            &copy; {new Date().getFullYear()} Blue Taxi PH
          </span>
        </div>
      </div>
    </footer>
  )
}
