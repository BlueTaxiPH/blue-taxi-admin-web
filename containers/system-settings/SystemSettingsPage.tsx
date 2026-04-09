"use client"

import { MapPin, Shield, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"
import { CityManagementTab } from "./CityManagementTab"
import { AccessControlTab } from "./AccessControlTab"
import { AdminUsersTab } from "./AdminUsersTab"
import type { AdminUser } from "@/types/admin-user"
import type { fetchCitiesWithCoords } from "@/lib/supabase/queries"

type City = Awaited<ReturnType<typeof fetchCitiesWithCoords>>[number]

interface SystemSettingsPageProps {
  adminUsers: AdminUser[]
  cities: City[]
  isSuperAdmin: boolean
}

export function SystemSettingsPage({
  adminUsers,
  cities,
  isSuperAdmin,
}: SystemSettingsPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        title="System Settings"
        subtitle="City configuration, access control, and admin management"
        breadcrumbs={["System Settings"]}
      />
      <div className="p-7">
        <Tabs defaultValue="cities" className="space-y-6">
          <TabsList
            className="bg-white"
            style={{ border: "1px solid #DCE6F1" }}
          >
            <TabsTrigger value="cities" className="gap-2">
              <MapPin className="size-3.5" aria-hidden />
              City Management
            </TabsTrigger>
            <TabsTrigger value="access" className="gap-2">
              <Shield className="size-3.5" aria-hidden />
              Access Control
            </TabsTrigger>
            <TabsTrigger value="admins" className="gap-2">
              <Users className="size-3.5" aria-hidden />
              Admin Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cities">
            <CityManagementTab cities={cities} />
          </TabsContent>
          <TabsContent value="access">
            <AccessControlTab isSuperAdmin={isSuperAdmin} />
          </TabsContent>
          <TabsContent value="admins">
            <AdminUsersTab users={adminUsers} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
