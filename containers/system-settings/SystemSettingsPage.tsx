"use client"

import { useState } from "react"

import { SystemSettingsHeader } from "./SystemSettingsHeader"
import { GeneralConfigurationCard } from "./GeneralConfigurationCard"
import { NotificationsCard } from "./NotificationsCard"
import { RoleBasedControlCard } from "./RoleBasedControlCard"
import {
  MODULES,
  type ModuleId,
  INITIAL_PERMISSIONS,
  INITIAL_ROLES,
  normalizeRoleId,
  type PermissionsState,
  type Role,
} from "./system-settings-model"

export function SystemSettingsPage() {
  const [platformCommission, setPlatformCommission] = useState("12.5")
  const [insuranceFeePolicy, setInsuranceFeePolicy] = useState("5.00")
  const [editableBySuperAdminOnly, setEditableBySuperAdminOnly] = useState(
    true
  )

  const [maskedCalling, setMaskedCalling] = useState(true)
  const [serverDowntimeCritical, setServerDowntimeCritical] = useState(true)
  const [matchSlaAlerts, setMatchSlaAlerts] = useState(false)

  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES)
  const [permissionsByModule, setPermissionsByModule] =
    useState<PermissionsState>(INITIAL_PERMISSIONS)

  const moduleIds = MODULES.map((m) => m.id)

  const [addRoleOpen, setAddRoleOpen] = useState(false)
  const [newRoleName, setNewRoleName] = useState("")

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle"
  )

  function updatePermission(moduleId: ModuleId, roleId: string, next: boolean) {
    setPermissionsByModule((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [roleId]: next,
      },
    }))
  }

  function handleSaveChanges() {
    setSaveState("saving")
    // UI-only mock: simulate a short save so the button feels responsive.
    window.setTimeout(() => setSaveState("saved"), 450)
    window.setTimeout(() => setSaveState("idle"), 2400)
  }

  function handleAddRole() {
    const trimmed = newRoleName.trim()
    if (!trimmed) return

    const baseId = normalizeRoleId(trimmed) || "role"
    let nextId = baseId
    let suffix = 2
    while (roles.some((r) => r.id === nextId)) {
      nextId = `${baseId}-${suffix}`
      suffix += 1
    }

    setRoles((prev) => [...prev, { id: nextId, name: trimmed }])
    setPermissionsByModule((prev) => {
      const next: PermissionsState = { ...prev } as PermissionsState
      for (const moduleId of moduleIds) {
        next[moduleId] = {
          ...prev[moduleId],
          [nextId]: false,
        }
      }
      return next
    })

    setAddRoleOpen(false)
    setNewRoleName("")
  }

  return (
    <div>
      <SystemSettingsHeader saveState={saveState} onSaveChanges={handleSaveChanges} />

      <div className="p-6 space-y-6">
        <div className="flex flex-row gap-6">
          <div className="flex-1">
            <GeneralConfigurationCard
              platformCommission={platformCommission}
              insuranceFeePolicy={insuranceFeePolicy}
              editableBySuperAdminOnly={editableBySuperAdminOnly}
              maskedCalling={maskedCalling}
              onPlatformCommissionChange={setPlatformCommission}
              onInsuranceFeePolicyChange={setInsuranceFeePolicy}
              onEditableBySuperAdminOnlyChange={setEditableBySuperAdminOnly}
              onMaskedCallingChange={setMaskedCalling}
            />
          </div>

          <div className="w-[320px]">
            <NotificationsCard
              serverDowntimeCritical={serverDowntimeCritical}
              matchSlaAlerts={matchSlaAlerts}
              onServerDowntimeCriticalChange={setServerDowntimeCritical}
              onMatchSlaAlertsChange={setMatchSlaAlerts}
            />
          </div>
        </div>

        <RoleBasedControlCard
          roles={roles}
          permissionsByModule={permissionsByModule}
          onUpdatePermission={updatePermission}
          addRoleOpen={addRoleOpen}
          setAddRoleOpen={setAddRoleOpen}
          newRoleName={newRoleName}
          setNewRoleName={setNewRoleName}
          onAddRole={handleAddRole}
        />
      </div>
    </div>
  )
}

