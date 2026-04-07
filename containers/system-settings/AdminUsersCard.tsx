"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  approveAdminUser,
  rejectAdminUser,
  changeAdminRole,
  deactivateAdminUser,
  reactivateAdminUser,
} from "@/app/actions/update-admin-user"
import type { AdminUser, AdminRole } from "@/types/admin-user"

const roleLabels: Record<AdminRole, string> = {
  superadmin: "Superadmin",
  blue_taxi_admin: "Blue Taxi Admin",
  insurance_admin: "Insurance Admin",
}

const statusBadgeClass: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-800 hover:bg-amber-100",
  active:   "bg-green-100 text-green-800 hover:bg-green-100",
  rejected: "bg-red-100 text-red-700 hover:bg-red-100",
  inactive: "bg-gray-100 text-gray-600 hover:bg-gray-100",
}

function getDisplayStatus(user: AdminUser): string {
  if (!user.is_active && user.admin_status === "active") return "inactive"
  return user.admin_status
}

export function AdminUsersCard({ users }: { users: AdminUser[] }) {
  const router = useRouter()
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [approveTarget, setApproveTarget] = useState<AdminUser | null>(null)
  const [selectedRole, setSelectedRole] = useState<AdminRole>("blue_taxi_admin")

  function loadingId(userId: string, action: string) {
    return `${userId}:${action}`
  }

  async function runAction(
    key: string,
    fn: () => Promise<{ success: boolean; error?: string }>
  ) {
    setLoadingKey(key)
    setError(null)
    const result = await fn()
    setLoadingKey(null)
    if (!result.success) {
      setError(result.error ?? "Something went wrong.")
    } else {
      router.refresh()
    }
  }

  async function handleApprove() {
    if (!approveTarget) return
    await runAction(loadingId(approveTarget.id, "approve"), () =>
      approveAdminUser(approveTarget.id, selectedRole)
    )
    setApproveTarget(null)
  }

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Users className="size-8 text-primary" aria-hidden />
        <div>
          <h2 className="text-lg font-semibold">Admin Users</h2>
          <p className="text-sm text-muted-foreground">Manage admin accounts</p>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 border border-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Name</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Email</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Phone</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Role</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((user) => {
              const displayStatus = getDisplayStatus(user)
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">{user.phone}</TableCell>
                  <TableCell>
                    {displayStatus === "active" ? (
                      <Select
                        defaultValue={user.admin_role ?? undefined}
                        onValueChange={(value) =>
                          runAction(
                            loadingId(user.id, "role"),
                            () => changeAdminRole(user.id, value as AdminRole)
                          )
                        }
                        disabled={loadingKey === loadingId(user.id, "role")}
                      >
                        <SelectTrigger className="h-8 w-[160px] text-sm">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.entries(roleLabels) as [AdminRole, string][]).map(([id, label]) => (
                            <SelectItem key={id} value={id}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {user.admin_role ? roleLabels[user.admin_role] : "—"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`capitalize ${statusBadgeClass[displayStatus] ?? ""}`}>
                      {displayStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {displayStatus === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => setApproveTarget(user)}
                            disabled={loadingKey?.startsWith(user.id) ?? false}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              runAction(loadingId(user.id, "reject"), () =>
                                rejectAdminUser(user.id)
                              )
                            }
                            disabled={loadingKey === loadingId(user.id, "reject")}
                          >
                            {loadingKey === loadingId(user.id, "reject") ? "Rejecting…" : "Reject"}
                          </Button>
                        </>
                      )}

                      {displayStatus === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            runAction(loadingId(user.id, "deactivate"), () =>
                              deactivateAdminUser(user.id)
                            )
                          }
                          disabled={loadingKey === loadingId(user.id, "deactivate")}
                        >
                          {loadingKey === loadingId(user.id, "deactivate") ? "Deactivating…" : "Deactivate"}
                        </Button>
                      )}

                      {displayStatus === "inactive" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            runAction(loadingId(user.id, "reactivate"), () =>
                              reactivateAdminUser(user.id)
                            )
                          }
                          disabled={loadingKey === loadingId(user.id, "reactivate")}
                        >
                          {loadingKey === loadingId(user.id, "reactivate") ? "Reactivating…" : "Reactivate"}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}

            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No admin users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Approve dialog */}
      <Dialog open={approveTarget !== null} onOpenChange={(open) => { if (!open) setApproveTarget(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Admin User</DialogTitle>
            <DialogDescription>
              Select a role for{" "}
              <span className="font-medium">
                {approveTarget?.first_name} {approveTarget?.last_name}
              </span>{" "}
              before approving their access.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 py-2">
            <label className="text-sm font-medium text-foreground">Role</label>
            <Select
              value={selectedRole}
              onValueChange={(v) => setSelectedRole(v as AdminRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(roleLabels) as [AdminRole, string][]).map(([id, label]) => (
                  <SelectItem key={id} value={id}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={loadingKey === loadingId(approveTarget?.id ?? "", "approve")}
            >
              {loadingKey === loadingId(approveTarget?.id ?? "", "approve") ? "Approving…" : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
