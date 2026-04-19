"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

import { ApproveAdminDialog } from "./ApproveAdminDialog"

const roleLabels: Record<AdminRole, string> = {
  superadmin: "Superadmin",
  blue_taxi_admin: "Blue Taxi Admin",
  insurance_admin: "Insurance Admin",
}

const statusBadgeClass: Record<string, string> = {
  pending:  "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]",
  active:   "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]",
  rejected: "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]",
  inactive: "bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]",
}

function getDisplayStatus(user: AdminUser): string {
  if (!user.is_active && user.admin_status === "active") return "inactive"
  return user.admin_status
}

interface AdminUsersCardProps {
  users: AdminUser[]
}

export function AdminUsersCard({ users }: AdminUsersCardProps) {
  const router = useRouter()
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [approveTarget, setApproveTarget] = useState<AdminUser | null>(null)

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

  async function handleApprove(role: AdminRole) {
    if (!approveTarget) return
    await runAction(loadingId(approveTarget.id, "approve"), () =>
      approveAdminUser(approveTarget.id, role)
    )
    setApproveTarget(null)
  }

  const approveLoading =
    approveTarget !== null &&
    loadingKey === loadingId(approveTarget.id, "approve")

  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{
        border: "1px solid #DCE6F1",
        boxShadow: "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid #EEF3F9" }}
      >
        <Users className="size-5 text-[#1A56DB]" aria-hidden />
        <div>
          <p
            className="text-sm font-semibold text-[#0D1B2A]"
            style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
          >
            Admin Users
          </p>
          <p className="text-xs text-[#4A607A]">
            Manage admin accounts and permissions
          </p>
        </div>
      </div>

      {error ? (
        <div className="mx-5 mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600" style={{ border: "1px solid #FECACA" }}>
          {error}
        </div>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "#EEF3F9" }}>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
              Name
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
              Email
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
              Phone
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
              Role
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
              Status
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex size-14 items-center justify-center rounded-full bg-[#F4F6FB]">
                    <Users className="size-7 text-[#8BACC8]" aria-hidden />
                  </div>
                  <p className="text-sm font-medium text-[#0D1B2A]">No admin users found</p>
                  <p className="text-xs text-[#8BACC8]">
                    Try adjusting your search or filters
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const displayStatus = getDisplayStatus(user)
              return (
                <TableRow
                  key={user.id}
                  className="transition-colors hover:bg-[#F4F8FF]"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                        style={{ background: "#EBF3FF", color: "#1A56DB" }}
                        aria-hidden
                      >
                        {(user.first_name?.[0] ?? "").toUpperCase()}
                        {(user.last_name?.[0] ?? "").toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-[#0D1B2A]">
                        {user.first_name} {user.last_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[#4A607A]">
                    {user.email}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-[#4A607A]">
                    {user.phone}
                  </TableCell>
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
                        <SelectTrigger className="h-8 w-[160px] text-sm" style={{ borderColor: "#DCE6F1" }}>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.entries(roleLabels) as [AdminRole, string][]).map(
                            ([id, label]) => (
                              <SelectItem key={id} value={id}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm text-[#8BACC8]">
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
                      {displayStatus === "pending" ? (
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
                            {loadingKey === loadingId(user.id, "reject")
                              ? "Rejecting…"
                              : "Reject"}
                          </Button>
                        </>
                      ) : null}

                      {displayStatus === "active" ? (
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
                          {loadingKey === loadingId(user.id, "deactivate")
                            ? "Deactivating…"
                            : "Deactivate"}
                        </Button>
                      ) : null}

                      {displayStatus === "inactive" ? (
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
                          {loadingKey === loadingId(user.id, "reactivate")
                            ? "Reactivating…"
                            : "Reactivate"}
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      <ApproveAdminDialog
        user={approveTarget}
        isSubmitting={approveLoading}
        onConfirm={handleApprove}
        onClose={() => setApproveTarget(null)}
      />
    </div>
  )
}
