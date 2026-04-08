import Image from "next/image"

export function LoginBranding() {
  return (
    <div
      className="relative hidden min-h-full flex-col overflow-hidden md:flex"
      style={{ background: "#060D1F" }}
    >
      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(59,130,246,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />

      {/* Radial glow behind where the car sits */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-[65%]"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 100%, rgba(26,86,219,0.22) 0%, rgba(26,86,219,0.06) 50%, transparent 70%)",
        }}
        aria-hidden
      />

      {/* Brand text — upper portion */}
      <div className="auth-animate-in relative z-10 flex flex-1 flex-col items-center justify-center px-10 py-16 text-center">
        {/* Eyebrow */}
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#3A6A9A]">
          Philippines
        </p>

        {/* Brand name */}
        <h1
          className="auth-animate-in auth-animate-in-delay-1 mt-3 text-[3.5rem] font-extrabold uppercase leading-none tracking-[0.05em] text-white"
          style={{
            fontFamily: "var(--font-outfit, sans-serif)",
            textShadow:
              "0 0 60px rgba(26,86,219,0.35), 0 2px 4px rgba(0,0,0,0.4)",
          }}
        >
          Blue Taxi
        </h1>

        {/* Role label */}
        <p className="auth-animate-in auth-animate-in-delay-1 mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#5B7BA8]">
          Admin Dashboard
        </p>

        {/* Divider */}
        <div className="auth-animate-in auth-animate-in-delay-2 mt-7 flex items-center gap-3">
          <div
            className="h-px w-14"
            style={{ background: "rgba(96,165,250,0.18)" }}
          />
          <div className="size-1.5 rounded-full bg-blue-500 opacity-60" />
          <div className="size-1.5 rounded-full bg-blue-400 opacity-80" />
          <div className="size-1.5 rounded-full bg-blue-500 opacity-60" />
          <div
            className="h-px w-14"
            style={{ background: "rgba(96,165,250,0.18)" }}
          />
        </div>

        {/* Tagline */}
        <p className="auth-animate-in auth-animate-in-delay-2 mt-6 max-w-[280px] text-sm leading-relaxed text-[#607D99]">
          Real-time fleet management and driver operations across the Philippines.
        </p>
      </div>

      {/* Car hero — bottom anchored */}
      <div className="auth-animate-in auth-animate-in-delay-3 relative z-10 mt-auto">
        {/* Gradient fade: top of image blends into dark panel */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20"
          style={{
            background:
              "linear-gradient(to bottom, #060D1F 0%, transparent 100%)",
          }}
          aria-hidden
        />

        <Image
          src="/taxi-front.png"
          alt="Blue Taxi — Philippines fleet vehicle"
          width={640}
          height={426}
          className="w-full object-contain"
          style={{
            filter:
              "drop-shadow(0 0 24px rgba(26,86,219,0.45)) drop-shadow(0 0 8px rgba(26,86,219,0.2))",
          }}
          priority
        />
      </div>

      {/* Footer */}
      <p className="absolute bottom-3 left-0 right-0 z-10 text-center text-[10px] uppercase tracking-widest text-[#1E3550]">
        © {new Date().getFullYear()} Blue Taxi Inc. · Philippines
      </p>
    </div>
  )
}
