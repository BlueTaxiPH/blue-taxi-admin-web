"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import { RoleBasedControlCard } from "./RoleBasedControlCard"
import {
  INITIAL_PERMISSIONS,
  INITIAL_ROLES,
  type ModuleId,
  type PermissionsState,
  type Role,
} from "./system-settings-model"

export function AccessControlTab() {
  const [roles] = useState<Role[]>(INITIAL_ROLES)
  const [permissions, setPermissions] =
    useState<PermissionsState>(INITIAL_PERMISSIONS)

  function updatePermission(moduleId: ModuleId, roleId: string, next: boolean) {
    setPermissions((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], [roleId]: next },
    }))
  }

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3"
        style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
      >
        <Info className="mt-0.5 size-4 shrink-0 text-[#1A56DB]" aria-hidden />
        <p className="text-sm text-[#1A56DB]">
          Permission changes are{" "}
          <span className="font-semibold">local reference only</span> and are
          not persisted to the database. This matrix reflects the default role
          configuration.
        </p>
      </div>

      <RoleBasedControlCard
        roles={roles}
        permissionsByModule={permissions}
        onUpdatePermission={updatePermission}
      />
    </div>
  )
}
