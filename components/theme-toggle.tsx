"use client"

import { useCallback, useEffect, useState } from "react"
import { MoonIcon } from "@/components/icons/moon-icon"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const isDark = root.classList.contains("dark")
    setDark(isDark)
  }, [])

  const toggle = useCallback(() => {
    const root = document.documentElement
    root.classList.toggle("dark")
    setDark(root.classList.contains("dark"))
  }, [])

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      <MoonIcon />
    </button>
  )
}
