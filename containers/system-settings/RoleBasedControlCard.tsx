"use client"

import { Shield } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  MODULES,
  type ModuleId,
  type PermissionsState,
  type Role,
} from "./system-settings-model"

interface RoleBasedControlCardProps {
  roles: Role[]
  permissionsByModule: PermissionsState
  onUpdatePermission: (moduleId: ModuleId, roleId: string, next: boolean) => void
  readonly?: boolean
}

export function RoleBasedControlCard({
  roles,
  permissionsByModule,
  onUpdatePermission,
  readonly = false,
}: RoleBasedControlCardProps) {
  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{
        border: "1px solid #DCE6F1",
        boxShadow: "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)",
      }}
    >
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid #EEF3F9" }}
      >
        <Shield className="size-5 text-[#1A56DB]" aria-hidden />
        <div>
          <p
            className="text-sm font-semibold text-[#0D1B2A]"
            style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
          >
            Role-Based Access Control
          </p>
          <p className="text-xs text-[#4A607A]">
            Define permissions per module for each admin role
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "#EEF3F9" }}>
            <TableHead className="w-[220px] text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
              Modules
            </TableHead>
            {roles.map((role) => (
              <TableHead
                key={role.id}
                className="text-center text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]"
              >
                {role.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {MODULES.map((module) => (
            <TableRow
              key={module.id}
              className="transition-colors hover:bg-[#F4F8FF]"
            >
              <TableCell className="text-sm font-medium text-[#0D1B2A]">
                {module.label}
              </TableCell>
              {roles.map((role) => (
                <TableCell
                  key={`${module.id}:${role.id}`}
                  className="text-center"
                >
                  <div className="flex w-full justify-center">
                    <Checkbox
                      checked={!!permissionsByModule[module.id]?.[role.id]}
                      onChange={(e) =>
                        onUpdatePermission(module.id, role.id, e.target.checked)
                      }
                      disabled={readonly}
                      style={readonly ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                    />
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
