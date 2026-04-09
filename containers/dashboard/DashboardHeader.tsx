import { PageHeader } from "@/components/page-header"
import { DashboardRefreshButton } from "./DashboardRefreshButton"

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
      actions={<DashboardRefreshButton />}
    />
  )
}
