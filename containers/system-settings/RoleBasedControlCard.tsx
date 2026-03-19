"use client"

import { ArrowRight, Plus, Shield } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { MODULES, type ModuleId, type PermissionsState, type Role } from "./system-settings-model"

export function RoleBasedControlCard({
  roles,
  permissionsByModule,
  onUpdatePermission,
  addRoleOpen,
  setAddRoleOpen,
  newRoleName,
  setNewRoleName,
  onAddRole,
}: {
  roles: Role[]
  permissionsByModule: PermissionsState
  onUpdatePermission: (moduleId: ModuleId, roleId: string, next: boolean) => void
  addRoleOpen: boolean
  setAddRoleOpen: (open: boolean) => void
  newRoleName: string
  setNewRoleName: (value: string) => void
  onAddRole: () => void
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-row items-center gap-2">
          <div className="flex items-center gap-2">
            <Shield className="size-8 text-primary" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Role-Based Access Control (RBAC)</h2>
            <p className="text-sm text-muted-foreground">
              Define permissions per module
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setAddRoleOpen(true)}
          >
            <Plus className="size-4" aria-hidden />
            Add Role
          </Button>
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

      <Dialog open={addRoleOpen} onOpenChange={setAddRoleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Role</DialogTitle>
            <DialogDescription>
              This will add a new role column to the RBAC matrix (mock state
              for now).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">
                Role name
              </label>
              <Input
                placeholder="e.g. Operations Manager"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddRoleOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={onAddRole} disabled={!newRoleName.trim()}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

