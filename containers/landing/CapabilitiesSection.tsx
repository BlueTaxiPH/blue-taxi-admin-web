import {
  Radar,
  Users,
  ShieldCheck,
  BarChart3,
  Wallet,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react"

type CapabilityCard = {
  key: string
  eyebrow: string
  title: string
  body: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  span: string
  delay: string
  accent?: string
}

const CARDS: CapabilityCard[] = [
  {
    key: "dispatch",
    eyebrow: "Dispatch",
    title: "Street-aware rider-to-driver matching.",
    body: "Atomic accept_ride RPC handles simultaneous taps across every active city. No double-bookings, no dropped trips.",
    icon: Radar,
    span: "md:col-span-8 md:row-span-2",
    delay: "0ms",
    accent: "#3B82F6",
  },
  {
    key: "drivers",
    eyebrow: "Roster",
    title: "Verification in one pane.",
    body: "License, OR, CR, NBI, vehicle, and selfie stacked in a single reviewer surface.",
    icon: Users,
    span: "md:col-span-4",
    delay: "80ms",
  },
  {
    key: "insurance",
    eyebrow: "Compliance",
    title: "Insurance manifest, reconciled daily.",
    body: "Platform fee meets every trip. Audit-ready exports, no spreadsheet drift.",
    icon: ShieldCheck,
    span: "md:col-span-4",
    delay: "160ms",
  },
  {
    key: "payouts",
    eyebrow: "Finance",
    title: "Cash-only, reconciled cleanly.",
    body: "Pending, processed, paid &mdash; traced back to the operator who keyed them.",
    icon: Wallet,
    span: "md:col-span-5",
    delay: "240ms",
  },
  {
    key: "insights",
    eyebrow: "Signal",
    title: "Operational health at a glance.",
    body: "Online supply against live demand, rolled up into a single daily posture read.",
    icon: BarChart3,
    span: "md:col-span-7",
    delay: "320ms",
    accent: "#10B981",
  },
  {
    key: "support",
    eyebrow: "Care",
    title: "Ride-scoped conversations.",
    body: "Every chat threaded to the ride that started it &mdash; no context loss between shifts.",
    icon: MessageSquare,
    span: "md:col-span-6",
    delay: "400ms",
  },
  {
    key: "realtime",
    eyebrow: "Realtime",
    title: "Supabase stream &mdash; no polling.",
    body: "Rides, locations, conversations, notifications, all on published channels.",
    icon: Radar,
    span: "md:col-span-6",
    delay: "480ms",
  },
]

export function CapabilitiesSection() {
  return (
    <section
      id="capabilities"
      className="relative px-4 py-24 md:px-8 md:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex max-w-2xl flex-col gap-6 md:mb-20">
          <span className="inline-flex w-max items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
            Operator surface
          </span>
          <h2
            className="text-[clamp(2rem,4.5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-white"
            style={{
              fontFamily: "var(--font-outfit, sans-serif)",
              textWrap: "balance",
            }}
          >
            One console for the people who keep the city moving.
          </h2>
          <p className="max-w-xl text-base leading-[1.65] text-white/55 md:text-lg">
            Every workflow &mdash; dispatch, verification, finance, care &mdash; designed around the way a Philippine operator actually works a shift.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
          {CARDS.map((card) => (
            <CapabilityTile key={card.key} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CapabilityTile({ card }: { card: CapabilityCard }) {
  const Icon = card.icon
  return (
    <article
      className={`landing-animate group ${card.span}`}
      style={{ animationDelay: card.delay }}
    >
      <div className="h-full rounded-[2rem] border border-white/[0.06] bg-white/[0.02] p-1.5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/15 hover:bg-white/[0.04]">
        <div
          className="landing-card-inner relative flex h-full flex-col justify-between overflow-hidden rounded-[calc(2rem-0.375rem)] border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 md:p-8"
          style={{ minHeight: "240px" }}
        >
          {card.accent ? (
            <div
              className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full opacity-40 blur-3xl transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-70"
              style={{ background: `radial-gradient(circle, ${card.accent}55, transparent 70%)` }}
              aria-hidden
            />
          ) : null}

          <div className="relative flex items-start justify-between">
            <span
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]"
              aria-hidden
            >
              <Icon className="size-4 text-white/75" strokeWidth={1.25} />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
              {card.eyebrow}
            </span>
          </div>

          <div className="relative mt-10 space-y-3">
            <h3
              className="text-xl font-semibold leading-[1.15] tracking-[-0.01em] text-white md:text-2xl"
              style={{ fontFamily: "var(--font-outfit, sans-serif)", textWrap: "balance" }}
              dangerouslySetInnerHTML={{ __html: card.title }}
            />
            <p
              className="text-[13px] leading-[1.6] text-white/55 md:text-sm"
              dangerouslySetInnerHTML={{ __html: card.body }}
            />
          </div>

          <div className="relative mt-8 flex items-center gap-2 text-[11px] font-medium text-white/45 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:text-white/85">
            <span>Explore in the console</span>
            <span
              className="flex size-5 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px"
              aria-hidden
            >
              <ArrowUpRight className="size-3" strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
