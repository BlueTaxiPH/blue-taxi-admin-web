import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: string[]
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 flex items-start justify-between gap-6 border-b px-7 py-5",
        "bg-[#F4F6FB]/90 backdrop-blur-sm",
        className
      )}
      style={{ borderColor: "#DCE6F1" }}
    >
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4A607A]">
            {breadcrumbs.join("  \u203A  ")}
          </p>
        ) : null}
        <h1
          className="text-2xl font-bold text-[#0D1B2A]"
          style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-[#4A607A]">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-3 pt-1">{actions}</div>
      ) : null}
    </div>
  )
}
