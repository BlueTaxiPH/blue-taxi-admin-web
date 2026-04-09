"use client"

import { useEffect, useState } from "react"
import { Lock } from "lucide-react"
import { RoleBasedControlCard } from "./RoleBasedControlCard"
import { fetchRolePermissions } from "@/app/actions/fetch-role-permissions"
import { updateRolePermission } from "@/app/actions/update-role-permission"
import {
  INITIAL_ROLES,
  type ModuleId,
  type PermissionsState,
  type Role,
} from "./system-settings-model"

interface AccessControlTabProps {
  isSuperAdmin: boolean
}

export function AccessControlTab({ isSuperAdmin }: AccessControlTabProps) {
  const [roles] = useState<Role[]>(INITIAL_ROLES)
  const [permissions, setPermissions] = useState<PermissionsState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRolePermissions().then((result) => {
      if (!result.success) {
        setError(result.error)
        setLoading(false)
        return
      }
      const state: Record<string, Record<string, boolean>> = {}
      for (const row of result.data ?? []) {
        if (!state[row.module]) state[row.module] = {}
        state[row.module][row.admin_role] = row.can_access
      }
      setPermissions(state as PermissionsState)
      setLoading(false)
    })
  }, [])

  async function handleUpdatePermission(moduleId: ModuleId, roleId: string, next: boolean) {
    if (!isSuperAdmin || !permissions) return

    const prev = permissions[moduleId]?.[roleId]

    // Optimistic update
    setPermissions((p) =>
      p ? { ...p, [moduleId]: { ...p[moduleId], [roleId]: next } } : p
    )

    const result = await updateRolePermission(roleId, moduleId, next)
    if (!result.success) {
      // Revert on failure
      setPermissions((p) =>
        p ? { ...p, [moduleId]: { ...p[moduleId], [roleId]: prev ?? false } } : p
      )
      setError(result.error)
    } else {
      setError(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-64 animate-pulse rounded-xl bg-[#EEF3F9]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!isSuperAdmin ? (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3"
          style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
        >
          <Lock className="mt-0.5 size-4 shrink-0 text-[#1A56DB]" aria-hidden />
          <p className="text-sm text-[#1A56DB]">
            You have <span className="font-semibold">read-only access</span> to this
            matrix. Only superadmins can modify permissions.
          </p>
        </div>
      ) : null}

      {error ? (
        <div
          className="rounded-xl px-4 py-3 text-sm text-red-700"
          style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <RoleBasedControlCard
        roles={roles}
        permissionsByModule={permissions ?? ({} as PermissionsState)}
        onUpdatePermission={handleUpdatePermission}
        readonly={!isSuperAdmin}
      />
    </div>
  )
}
