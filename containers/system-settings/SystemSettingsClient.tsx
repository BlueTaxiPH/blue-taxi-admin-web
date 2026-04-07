"use client"

import { useState } from "react"

import { SystemSettingsHeader } from "./SystemSettingsHeader"
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
      <SystemSettingsHeader saveState={saveState} onSaveChanges={handleSaveChanges} />
      <div className="p-6">
        <RoleBasedControlCard
          roles={roles}
          permissionsByModule={permissionsByModule}
          onUpdatePermission={updatePermission}
        />
      </div>
    </>
  )
}
