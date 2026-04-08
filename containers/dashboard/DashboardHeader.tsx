import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"

export function DashboardHeader() {
  const formattedDate = new Intl.DateTimeFormat("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date())

  return (
    <PageHeader
      title="Executive Overview"
      subtitle={`Real-time operations \u00B7 ${formattedDate}`}
      breadcrumbs={["Dashboard"]}
      actions={
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      }
    />
  )
}
