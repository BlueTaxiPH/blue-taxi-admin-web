import { TaxiIcon } from "@/components/icons/taxi-icon"

export function LoginBranding() {
  return (
    <div
      className="flex min-h-full flex-col px-10 py-12 md:px-14 md:py-16"
      style={{ backgroundColor: "#1A56DB" }}
    >
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-8 flex size-16 items-center justify-center rounded-xl border-2 border-white/90 bg-white/5">
          <TaxiIcon className="size-9 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          BLUE <span className="text-white/90">TAXI</span>
        </h1>
        <p className="mt-2 text-sm font-medium uppercase tracking-widest text-white/90">
          Admin Dashboard
        </p>
        <p className="mt-6 max-w-lg text-xl leading-relaxed text-white/80">
          Enterprise fleet management and real-time operations control center.
        </p>
      </div>
      <p className="text-center text-xs text-white/60">
        © 2024 BLUE TAXI INC. ENTERPRISE SYSTEMS
      </p>
    </div>
  )
}
