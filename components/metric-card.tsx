import { BarChart3 } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type MetricBadgeTone =
  | "live"
  | "idle"
  | "success"
  | "warning"
  | "danger"
  | "info"

interface MetricBadge {
  label: string
  tone: MetricBadgeTone
  tooltip?: string
}

interface MetricCardProps {
  label: string
  value: string
  prefix?: string
  context?: string
  icon?: React.ComponentType<{
    className?: string
    style?: React.CSSProperties
  }>
  accent?: string
  badge?: MetricBadge | null
  animationDelay?: number
  className?: string
}

const BADGE_STYLES: Record<
  MetricBadgeTone,
  { bg: string; fg: string; dot: string; pulse?: boolean }
> = {
  live:    { bg: "#ECFDF5", fg: "#059669", dot: "#10B981", pulse: true },
  idle:    { bg: "#F9FAFB", fg: "#6B7280", dot: "#D1D5DB" },
  success: { bg: "#ECFDF5", fg: "#059669", dot: "#10B981" },
  warning: { bg: "#FFFBEB", fg: "#D97706", dot: "#F59E0B" },
  danger:  { bg: "#FEF2F2", fg: "#DC2626", dot: "#EF4444" },
  info:    { bg: "#EFF6FF", fg: "#1A56DB", dot: "#3B82F6" },
}

export function MetricCard({
  label,
  value,
  prefix,
  context,
  icon: Icon = BarChart3,
  accent = "#1A56DB",
  badge,
  animationDelay,
  className,
}: MetricCardProps) {
  const badgeStyle = badge ? BADGE_STYLES[badge.tone] : null

  const card = (
    <div
      className={cn(
        "metric-card-hover dash-animate-in group relative overflow-hidden rounded-xl bg-white p-6 transition-all duration-200 hover:-translate-y-0.5",
        className
      )}
      style={{
        border: "1px solid #DCE6F1",
        boxShadow:
          "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)",
        animationDelay:
          animationDelay !== undefined ? `${animationDelay}ms` : undefined,
      }}
    >
      <div
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ background: accent }}
        aria-hidden
      />

      <div className="pl-2">
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-xl"
            style={{ background: `${accent}14` }}
          >
            <Icon className="size-5" style={{ color: accent }} />
          </div>

          {badge && badgeStyle ? (
            <BadgePill badge={badge} style={badgeStyle} />
          ) : null}
        </div>

        <p className="mt-4 text-sm font-medium text-[#4A607A]">{label}</p>

        <p className="mt-1 text-[2rem] font-bold leading-none text-[#0D1B2A]">
          {prefix ? (
            <span className="font-sans text-[1.25rem]">{prefix}</span>
          ) : null}
          <span className="font-mono tabular-nums">{value}</span>
        </p>

        {context ? (
          <p className="mt-2 text-[11px] text-[#8BACC8]">{context}</p>
        ) : null}
      </div>
    </div>
  )

  return card
}

function BadgePill({
  badge,
  style,
}: {
  badge: MetricBadge
  style: { bg: string; fg: string; dot: string; pulse?: boolean }
}) {
  const pill = (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
      style={{ background: style.bg, color: style.fg }}
      aria-label={badge.tooltip ?? badge.label}
    >
      <span className="relative flex size-1.5 shrink-0">
        {style.pulse ? (
          <span
            className="absolute inline-flex size-full animate-ping rounded-full opacity-75"
            style={{ background: style.dot }}
          />
        ) : null}
        <span
          className="relative inline-flex size-1.5 rounded-full"
          style={{ background: style.dot }}
        />
      </span>
      {badge.label}
    </span>
  )

  if (!badge.tooltip) return pill

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="cursor-help outline-none">
            {pill}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px]">
          {badge.tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
