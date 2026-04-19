"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowUpRight } from "lucide-react"

const NAV_LINKS: Array<{ label: string; href: string }> = [
  { label: "Platform", href: "#capabilities" },
  { label: "Pilot", href: "#pilot" },
  { label: "Operators", href: "#operators" },
  { label: "Contact", href: "mailto:ops@bluetaxi.ph" },
]

export function LandingNav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-5 md:pt-6"
      >
        <div
          className="flex w-full max-w-3xl items-center justify-between gap-4 rounded-full border border-white/10 bg-black/50 px-4 py-2 backdrop-blur-2xl md:w-max md:min-w-[480px]"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 40px -16px rgba(3, 7, 20, 0.9)" }}
        >
          <Link
            href="/"
            className="group flex items-center gap-2.5 rounded-full px-2.5 py-1 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/5"
          >
            <span className="relative flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1A56DB]">
              <span
                className="absolute inset-0 rounded-full opacity-60 blur-md"
                style={{ background: "radial-gradient(circle, #3B82F6 0%, transparent 70%)" }}
                aria-hidden
              />
              <span
                className="relative font-semibold text-white"
                style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "11px", letterSpacing: "0.02em" }}
              >
                b
              </span>
            </span>
            <span
              className="text-sm font-semibold tracking-tight text-white"
              style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
            >
              Blue Taxi
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-full px-3 py-1.5 text-[13px] font-medium text-white/70 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="group relative hidden items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[13px] font-semibold text-[#050505] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/90 active:scale-[0.97] md:inline-flex"
            >
              Admin sign in
              <span className="flex size-5 items-center justify-center rounded-full bg-[#050505]/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px">
                <ArrowUpRight className="size-3" strokeWidth={1.5} aria-hidden />
              </span>
            </Link>

            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="group flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 md:hidden"
            >
              <span className="relative block h-3 w-4">
                <span
                  className={`absolute left-0 right-0 top-0 block h-px origin-center bg-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "translate-y-[5px] rotate-45" : ""}`}
                />
                <span
                  className={`absolute bottom-0 left-0 right-0 block h-px origin-center bg-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
                />
              </span>
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-30 md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-black/80 backdrop-blur-3xl transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div className="relative flex h-full flex-col justify-between px-6 pb-10 pt-28">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link, i) => (
              <li
                key={link.label}
                className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
                style={{ transitionDelay: open ? `${80 + i * 60}ms` : "0ms" }}
              >
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between border-b border-white/5 py-5 text-2xl font-medium tracking-tight text-white"
                  style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
                >
                  {link.label}
                  <ArrowUpRight
                    className="size-5 text-white/40 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
                    strokeWidth={1.25}
                    aria-hidden
                  />
                </a>
              </li>
            ))}
          </ul>

          <div
            className={`transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
            style={{ transitionDelay: open ? "360ms" : "0ms" }}
          >
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="group flex items-center justify-between rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#050505]"
            >
              Admin sign in
              <span className="flex size-7 items-center justify-center rounded-full bg-[#050505]/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px">
                <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
