"use client"

import { cn } from "@/lib/utils"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface InsuredTripManifestPaginationProps {
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
}

export function InsuredTripManifestPagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
}: InsuredTripManifestPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalCount)

  const pages: (number | "ellipsis")[] = []
  if (totalPages <= 8) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1, 2, 3, "ellipsis", totalPages)
  }

  return (
    <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {start} to {end} of {totalCount} entries
      </p>
      <Pagination className="mx-0 w-auto justify-start sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (page > 1) onPageChange(page - 1)
              }}
              aria-disabled={page <= 1}
              className={cn(page <= 1 && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
          {pages.map((p, i) =>
            p === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={page === p}
                  onClick={(e) => {
                    e.preventDefault()
                    onPageChange(p)
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (page < totalPages) onPageChange(page + 1)
              }}
              aria-disabled={page >= totalPages}
              className={cn(page >= totalPages && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
