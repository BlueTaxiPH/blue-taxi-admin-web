"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  label,
  id,
  ...props
}: React.ComponentProps<"input"> & { label?: React.ReactNode; id?: string }) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={inputId}
        data-slot="checkbox"
        className={cn(
          "size-4 rounded-full border border-input accent-[#1A56DB] checked:border-[#1A56DB] outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      />
      {label != null && (
        <label
          htmlFor={inputId}
          className="text-sm text-muted-foreground cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  )
}

export { Checkbox }
