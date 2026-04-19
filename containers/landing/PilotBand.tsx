interface PilotBandProps {
  cities: string[]
}

export function PilotBand({ cities }: PilotBandProps) {
  const cityCount = cities.length
  const citySummary =
    cityCount === 0
      ? "cities served, one tap to add another"
      : cityCount === 1
        ? `city served: ${cities[0]}`
        : `cities served · starting from Metro Manila`

  const serviceAreaLabel =
    cityCount === 0
      ? "Active service area"
      : cityCount === 1
        ? "Active city"
        : "Active cities"

  const stats: Array<{ label: string; value: string; caption: string }> = [
    {
      label: "Drivers onboarded",
      value: "528",
      caption: "from 614 applicants, manually reviewed",
    },
    {
      label: serviceAreaLabel,
      value: cityCount > 0 ? String(cityCount) : "—",
      caption: citySummary,
    },
    {
      label: "Trips reconciled",
      value: "100%",
      caption: "every ride tied to an insurance manifest",
    },
  ]

  return (
    <section id="pilot" className="relative px-4 py-24 md:px-8 md:py-32">
      <div className="relative mx-auto max-w-7xl">
        <div className="rounded-[2.5rem] border border-white/[0.06] bg-white/[0.02] p-1.5">
          <div className="landing-card-inner overflow-hidden rounded-[calc(2.5rem-0.375rem)] border border-white/5 bg-gradient-to-b from-white/[0.04] to-white/[0.01] px-6 py-14 md:px-14 md:py-20 lg:px-20 lg:py-24">
            <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:items-end md:gap-16">
              <div className="space-y-6">
                <span className="inline-flex w-max items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
                  Soft pilot &middot; 2026
                </span>
                <h2
                  className="text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-white"
                  style={{
                    fontFamily: "var(--font-outfit, sans-serif)",
                    textWrap: "balance",
                  }}
                >
                  Built in Manila,
                  <br className="hidden md:block" />{" "}
                  <span className="bg-gradient-to-br from-white/80 to-white/35 bg-clip-text text-transparent">
                    scaling with the Philippines.
                  </span>
                </h2>
                <p className="max-w-md text-base leading-[1.65] text-white/55 md:text-lg">
                  We are deliberately small: a limited pilot, cash-only, tight operator team. Every decision is tested on real shifts &mdash; city by city &mdash; before it reaches the rest of the fleet.
                </p>

                {cityCount > 0 ? (
                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
                      Currently operating
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {cities.map((city, i) => (
                        <li
                          key={city}
                          className="landing-animate inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-white/80"
                          style={{ animationDelay: `${80 + i * 40}ms` }}
                        >
                          <span
                            className="inline-block size-1 rounded-full bg-emerald-400/80"
                            aria-hidden
                          />
                          {city}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((stat, i) => (
                  <div
                    key={stat.label}
                    className="landing-animate rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                    style={{ animationDelay: `${120 + i * 80}ms` }}
                  >
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                      {stat.label}
                    </dt>
                    <dd
                      className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl"
                      style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
                    >
                      <span className="font-mono tabular-nums">{stat.value}</span>
                    </dd>
                    <p className="mt-2 text-[11px] leading-[1.55] text-white/45">{stat.caption}</p>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
