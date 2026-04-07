import { TaxiIcon } from "@/components/icons/taxi-icon"

const RING_SIZES = [560, 380, 220]

const FEATURES = [
  "Driver onboarding & verification",
  "Live ride oversight & dispatch",
  "Automated earnings & payouts",
]

export function LoginBranding() {
  return (
    <div
      className="relative hidden min-h-full flex-col overflow-hidden md:flex"
      style={{ backgroundColor: "#020817" }}
    >
      {/* Subtle crosshatch grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            "linear-gradient(rgba(59,130,246,0.035) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(59,130,246,0.035) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "64px 64px",
        }}
        aria-hidden
      />

      {/* Central radial glow — anchors the ring composition */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(26,86,219,0.09) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        aria-hidden
      />

      {/* Concentric rings */}
      {RING_SIZES.map((size, i) => (
        <div
          key={size}
          className="pointer-events-none absolute rounded-full"
          style={{
            width: size,
            height: size,
            border: `1px solid rgba(59,130,246,${0.06 + i * 0.04})`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          aria-hidden
        />
      ))}

      {/* Center icon — sits inside the innermost ring */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        aria-hidden
      >
        <div
          className="flex size-16 items-center justify-center rounded-2xl"
          style={{
            background: "rgba(26,86,219,0.14)",
            border: "1px solid rgba(59,130,246,0.28)",
            boxShadow:
              "0 0 32px rgba(26,86,219,0.22), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <TaxiIcon className="size-8 text-blue-400" />
        </div>
      </div>

      {/* Content layer */}
      <div className="relative z-10 flex flex-1 flex-col justify-between px-10 py-14 md:px-12 md:py-16">
        {/* Top-left brand identifier */}
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50"
            style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
          >
            Blue Taxi
          </span>
          <span className="text-white/20">·</span>
          <span className="text-[11px] uppercase tracking-[0.25em] text-white/25">
            Admin
          </span>
        </div>

        {/* Editorial headline anchored to bottom-left */}
        <div className="mt-auto">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-400/60">
            Fleet Operations Platform
          </p>
          <h1
            className="text-4xl font-extrabold leading-[1.1] text-white md:text-[2.6rem]"
            style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
          >
            Command center for Philippine mobility.
          </h1>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/35">
            Real-time dispatch, driver management, and revenue analytics — unified in one dashboard.
          </p>

          <div className="mt-8 space-y-3">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div
                  className="size-1 shrink-0 rounded-full"
                  style={{ backgroundColor: "rgba(59,130,246,0.7)" }}
                />
                <span className="text-xs text-white/38">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
        <p className="mt-10 text-[11px] uppercase tracking-widest text-white/15">
          © {new Date().getFullYear()} Blue Taxi Inc. · Philippines
        </p>
      </div>
    </div>
  )
}
