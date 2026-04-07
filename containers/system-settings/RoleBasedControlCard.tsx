"use client"

import { ArrowRight, Shield } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { MODULES, type ModuleId, type PermissionsState, type Role } from "./system-settings-model"

export function RoleBasedControlCard({
  roles,
  permissionsByModule,
  onUpdatePermission,
}: {
  roles: Role[]
  permissionsByModule: PermissionsState
  onUpdatePermission: (moduleId: ModuleId, roleId: string, next: boolean) => void
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Shield className="size-8 text-primary" aria-hidden />
        <div>
          <h2 className="text-lg font-semibold">Role-Based Access Control (RBAC)</h2>
          <p className="text-sm text-muted-foreground">
            Define permissions per module
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px] text-xs uppercase tracking-wider text-muted-foreground">
                Modules
              </TableHead>
              {roles.map((role) => (
                <TableHead
                  key={role.id}
                  className="text-center text-xs uppercase tracking-wider text-muted-foreground"
                >
                  {role.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {MODULES.map((module) => (
              <TableRow key={module.id}>
                <TableCell className="font-medium">
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
                          onUpdatePermission(
                            module.id,
                            role.id,
                            e.target.checked
                          )
                        }
                      />
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 flex items-center justify-end">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            Manage Advanced Permissions{" "}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </section>
  )
}
