"use client"

import { Car, Van } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

interface ServiceAvailabilityCardProps {
  isBlueBasicEnabled: boolean
  onBlueBasicChange: (value: boolean) => void
  isBlueXlEnabled: boolean
  onBlueXlChange: (value: boolean) => void
}

export function ServiceAvailabilityCard({
  isBlueBasicEnabled,
  onBlueBasicChange,
  isBlueXlEnabled,
  onBlueXlChange,
}: ServiceAvailabilityCardProps) {
  return (
    <Card className="gap-4 py-5">
      <CardHeader className="px-5 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Service Availability</CardTitle>
          <p className="text-xs text-muted-foreground">
            Changes propagate instantly
          </p>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 px-5 sm:grid-cols-2">
        <Card className="gap-3 py-4">
          <CardContent className="space-y-2 px-4">
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Car className="size-4" />
              </div>
              <Switch
                checked={isBlueBasicEnabled}
                onCheckedChange={onBlueBasicChange}
                aria-label="Toggle Blue Basic"
              />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Blue Basic</h3>
              <p className="text-sm text-muted-foreground">
                Standard 4-seater daily rides
              </p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <Badge
                variant={isBlueBasicEnabled ? "secondary" : "outline"}
                className={
                  isBlueBasicEnabled
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-muted-foreground"
                }
              >
                {isBlueBasicEnabled ? "Active" : "Inactive"}
              </Badge>
              <span className="text-xs text-muted-foreground">ID: S-001</span>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-3 py-4">
          <CardContent className="space-y-2 px-4">
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
                <Van className="size-4" />
              </div>
              <Switch
                checked={isBlueXlEnabled}
                onCheckedChange={onBlueXlChange}
                aria-label="Toggle Blue XL"
              />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Blue XL</h3>
              <p className="text-sm text-muted-foreground">
                Spacious 6-seater for groups
              </p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <Badge
                variant={isBlueXlEnabled ? "secondary" : "outline"}
                className={
                  isBlueXlEnabled
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-muted-foreground"
                }
              >
                {isBlueXlEnabled ? "Active" : "Inactive"}
              </Badge>
              <span className="text-xs text-muted-foreground">ID: S-002</span>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
