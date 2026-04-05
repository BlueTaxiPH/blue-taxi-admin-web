import { DriverManagementPage } from "./DriverManagementPage"

interface DriverManagementSectionProps {
  cities?: Array<{ id: string; name: string; is_active: boolean }>
}

export default function DriverManagementSection({
  cities = [],
}: DriverManagementSectionProps) {
  return <DriverManagementPage cities={cities} />
}
