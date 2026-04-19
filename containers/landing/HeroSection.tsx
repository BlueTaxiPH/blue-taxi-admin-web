import Link from "next/link"
import {
  ArrowUpRight,
  Activity,
  Car,
  ShieldCheck,
  Clock3,
} from "lucide-react"

// Default driver names shown in the dispatch card. City is overridden with a
// real active city when one is available.
const FALLBACK_DRIVERS: Array<{ name: string; city: string; eta: string }> = [
  { name: "Maria Santos", city: "Metro Manila", eta: "2m" },
  { name: "Reynaldo Cruz", city: "Metro Manila", eta: "5m" },
  { name: "Joana de Leon", city: "Metro Manila", eta: "7m" },
]

function buildLiveDrivers(cities: string[]) {
  if (cities.length === 0) return FALLBACK_DRIVERS
  return FALLBACK_DRIVERS.map((d, i) => ({
    ...d,
    city: cities[i % cities.length],
  }))
}

interface HeroSectionProps {
  cities: string[]
}

export function HeroSection({ cities }: HeroSectionProps) {
  const cityCount = cities.length
  const liveDrivers = buildLiveDrivers(cities)

  const eyebrowLabel =
    cityCount === 0
      ? "Now live · Philippines"
      : cityCount === 1
        ? `Now live · ${cities[0]}`
        : `Now live · ${cityCount} cities`

  const dispatchCaption =
    cityCount === 0
      ? "trips active right now"
      : cityCount === 1
        ? `active in ${cities[0]}`
        : `active across ${cityCount} service cities`

  const stats: Array<{ label: string; value: string }> = [
    { label: "Pilot fleet", value: "600" },
    {
      label: "Cities live",
      value: cityCount > 0 ? String(cityCount) : "—",
    },
    { label: "Avg dispatch", value: "2.4m" },
  ]

  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-32 md:px-8 md:pt-40 lg:pt-44">
      <div className="mx-auto grid max-w-7xl gap-12 md:gap-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
        <div className="flex flex-col gap-8">
          <div
            className="landing-animate inline-flex w-max items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1"
            style={{ animationDelay: "0ms" }}
          >
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/60" aria-hidden />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" aria-hidden />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75">
              {eyebrowLabel}
            </span>
          </div>

          <h1
            className="landing-animate text-[clamp(2.75rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-white"
            style={{
              fontFamily: "var(--font-outfit, sans-serif)",
              textWrap: "balance",
              animationDelay: "120ms",
            }}
          >
            The operator platform
            <br className="hidden sm:block" />{" "}
            <span className="bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
              built for Philippine streets.
            </span>
          </h1>

          <p
            className="landing-animate max-w-lg text-base leading-[1.6] text-white/65 md:text-lg"
            style={{ animationDelay: "240ms" }}
          >
            Dispatch, verification, insurance, and payouts &mdash; stitched into a single deliberate surface for the teams keeping 600 drivers on the road across every city we serve.
          </p>

          <div
            className="landing-animate flex flex-col items-start gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "360ms" }}
          >
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2.5 rounded-full bg-white pl-5 pr-2 py-2 text-sm font-semibold text-[#050505] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/95 active:scale-[0.98]"
            >
              Admin sign in
              <span className="flex size-8 items-center justify-center rounded-full bg-[#050505]/10 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden />
              </span>
            </Link>

            <a
              href="mailto:ops@bluetaxi.ph?subject=Admin%20access%20request"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-[11px] text-sm font-medium text-white/80 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
            >
              Request access
              <ArrowUpRight className="size-3.5 text-white/50 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:text-white" strokeWidth={1.5} aria-hidden />
            </a>
          </div>

          <dl
            className="landing-animate mt-6 grid max-w-md grid-cols-3 gap-6 border-t border-white/5 pt-6"
            style={{ animationDelay: "480ms" }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  {stat.label}
                </dt>
                <dd
                  className="text-xl font-semibold tracking-tight text-white md:text-2xl"
                  style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
                >
                  <span className="font-mono tabular-nums">{stat.value}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroVisual liveDrivers={liveDrivers} dispatchCaption={dispatchCaption} />
      </div>
    </section>
  )
}

function HeroVisual({
  liveDrivers,
  dispatchCaption,
}: {
  liveDrivers: Array<{ name: string; city: string; eta: string }>
  dispatchCaption: string
}) {
  return (
    <div className="relative">
      <div
        className="landing-animate absolute -right-6 -top-12 hidden h-56 w-56 rounded-full blur-3xl lg:block"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.45), transparent 70%)",
          animationDelay: "120ms",
        }}
        aria-hidden
      />

      <div className="relative space-y-5">
        <HeroCard delay="200ms" rotation="-1.2deg" offset="translate-x-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
                <Activity className="size-3" strokeWidth={1.25} aria-hidden />
                Live dispatch
              </p>
              <p
                className="mt-3 text-3xl font-semibold tracking-tight text-white"
                style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
              >
                <span className="font-mono tabular-nums">47</span>
                <span className="ml-1 text-base font-medium text-white/45">trips</span>
              </p>
              <p className="mt-1 text-[11px] text-white/40">{dispatchCaption}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 text-right">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-300 ring-1 ring-inset ring-emerald-400/20">
                <span className="size-1 rounded-full bg-emerald-400 landing-pulse" aria-hidden />
                Live
              </span>
              <span className="font-mono text-[10px] text-white/35">GMT+8</span>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {liveDrivers.map((driver, i) => (
              <div
                key={driver.name}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] text-[10px] font-semibold text-white/75"
                    aria-hidden
                  >
                    {driver.name.split(" ").map((p) => p[0]).join("")}
                  </span>
                  <div>
                    <p className="text-[11px] font-medium leading-tight text-white/85">{driver.name}</p>
                    <p className="text-[10px] text-white/40">{driver.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-white/55">
                  <Clock3 className="size-3" strokeWidth={1.25} aria-hidden />
                  <span className="font-mono tabular-nums">{driver.eta}</span>
                  <span
                    className="ml-1 inline-block size-1 rounded-full bg-emerald-400/70"
                    style={{ animationDelay: `${i * 0.3}s` }}
                    aria-hidden
                  />
                </div>
              </div>
            ))}
          </div>
        </HeroCard>

        <div className="grid grid-cols-2 gap-4">
          <HeroCard delay="340ms" rotation="1.8deg" compact>
            <div className="flex items-center justify-between">
              <Car className="size-4 text-white/60" strokeWidth={1.25} aria-hidden />
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
                Roster
              </span>
            </div>
            <p
              className="mt-6 text-2xl font-semibold tracking-tight text-white"
              style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
            >
              <span className="font-mono tabular-nums">528</span>
            </p>
            <p className="text-[10px] text-white/40">approved drivers &middot; 72 in review</p>
          </HeroCard>

          <HeroCard delay="420ms" rotation="-2.2deg" compact>
            <div className="flex items-center justify-between">
              <ShieldCheck className="size-4 text-white/60" strokeWidth={1.25} aria-hidden />
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
                Insured
              </span>
            </div>
            <p
              className="mt-6 text-2xl font-semibold tracking-tight text-white"
              style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
            >
              <span className="font-mono tabular-nums">99.2</span>
              <span className="ml-0.5 text-base text-white/45">%</span>
            </p>
            <p className="text-[10px] text-white/40">trips with manifest match</p>
          </HeroCard>
        </div>
      </div>
    </div>
  )
}

function HeroCard({
  children,
  delay,
  rotation,
  offset,
  compact = false,
}: {
  children: React.ReactNode
  delay: string
  rotation: string
  offset?: string
  compact?: boolean
}) {
  return (
    <div
      className={`landing-animate ${offset ?? ""}`}
      style={{ animationDelay: delay }}
    >
      <div
        className="rounded-[2rem] border border-white/[0.06] bg-white/[0.02] p-1.5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:rotate-0"
        style={{ transform: `rotate(${rotation})` }}
      >
        <div
          className={`landing-card-inner rounded-[calc(2rem-0.375rem)] border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.015] backdrop-blur-xl ${compact ? "p-4" : "p-5"}`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
