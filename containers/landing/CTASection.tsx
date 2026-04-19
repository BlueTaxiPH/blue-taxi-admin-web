import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export function CTASection() {
  return (
    <section
      id="operators"
      className="relative px-4 pb-32 pt-8 md:px-8 md:pb-40"
    >
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.06] bg-white/[0.02] p-1.5">
          <div className="landing-card-inner relative overflow-hidden rounded-[calc(2.5rem-0.375rem)] border border-white/5 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-white/[0.01] px-6 py-16 md:px-16 md:py-24">
            <div
              className="pointer-events-none absolute -left-20 top-10 size-[420px] rounded-full opacity-50 blur-3xl landing-drift"
              style={{
                background:
                  "radial-gradient(circle, rgba(59,130,246,0.45), transparent 70%)",
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -right-10 -bottom-20 size-[360px] rounded-full opacity-40 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)",
              }}
              aria-hidden
            />

            <div className="relative flex flex-col items-start gap-10 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl space-y-6">
                <span className="inline-flex w-max items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75">
                  Operators only
                </span>
                <h2
                  className="text-[clamp(2rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.028em] text-white"
                  style={{ fontFamily: "var(--font-outfit, sans-serif)", textWrap: "balance" }}
                >
                  Sign in and get to work.
                </h2>
                <p className="max-w-lg text-base leading-[1.65] text-white/60 md:text-lg">
                  Access is issued by invitation while we hold the pilot tight. If your team should be inside, reach out &mdash; we usually reply within a shift.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-stretch">
                <Link
                  href="/login"
                  className="group relative inline-flex items-center justify-between gap-6 rounded-full bg-white pl-6 pr-2 py-2.5 text-sm font-semibold text-[#050505] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/95 active:scale-[0.98]"
                >
                  Admin sign in
                  <span className="flex size-9 items-center justify-center rounded-full bg-[#050505]/10 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[2px]">
                    <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden />
                  </span>
                </Link>
                <a
                  href="mailto:ops@bluetaxi.ph?subject=Admin%20access%20request"
                  className="group inline-flex items-center justify-between gap-6 rounded-full border border-white/15 bg-white/[0.03] pl-6 pr-2 py-2.5 text-sm font-medium text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/25 hover:bg-white/[0.06]"
                >
                  Request access
                  <span className="flex size-9 items-center justify-center rounded-full bg-white/5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[2px]">
                    <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
