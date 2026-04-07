"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { RoleBasedControlCard } from "./RoleBasedControlCard"
import {
  type ModuleId,
  INITIAL_PERMISSIONS,
  INITIAL_ROLES,
  type PermissionsState,
  type Role,
} from "./system-settings-model"

export function SystemSettingsClient() {
  const [roles] = useState<Role[]>(INITIAL_ROLES)
  const [permissionsByModule, setPermissionsByModule] =
    useState<PermissionsState>(INITIAL_PERMISSIONS)

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle")

  function updatePermission(moduleId: ModuleId, roleId: string, next: boolean) {
    setPermissionsByModule((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], [roleId]: next },
    }))
  }

  function handleSaveChanges() {
    setSaveState("saving")
    window.setTimeout(() => setSaveState("saved"), 450)
    window.setTimeout(() => setSaveState("idle"), 2400)
  }

  return (
    <>
      <PageHeader
        title="System Settings"
        subtitle="Platform configuration and access control"
        breadcrumbs={["System Settings"]}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline">Audit Logs</Button>
            <Button onClick={handleSaveChanges} disabled={saveState === "saving"}>
              {saveState === "saving" ? "Saving\u2026" : "Save Changes"}
            </Button>
          </div>
        }
      />
      <div className="p-7">
        <RoleBasedControlCard
          roles={roles}
          permissionsByModule={permissionsByModule}
          onUpdatePermission={updatePermission}
        />
      </div>
    </>
  )
}
