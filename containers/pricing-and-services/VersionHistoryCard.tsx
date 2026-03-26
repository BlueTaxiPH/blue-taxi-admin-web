"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const versionHistory = [
  {
    title: "Base Fare Adjustment",
    date: "Today, 10:42 AM",
    author: "John Smith",
    details: "Economy Base: P 14 -> 16",
  },
  {
    title: "Holiday Surge Update",
    date: "Oct 22, 4:30 PM",
    author: "Alice Sarah",
    details: "Applied holiday surge multiplier cap",
  },
  {
    title: "Global Rate Revision",
    date: "Oct 15, 09:15 AM",
    author: "John Smith",
    details: "Q4 pricing strategy adjustment",
  },
  {
    title: "Initial Config",
    date: "Sep 01, 12:00 PM",
    author: "System",
    details: "Initial pricing configuration setup",
  },
]

export function VersionHistoryCard() {
  return (
    <Card className="h-full gap-4 py-5">
      <CardHeader className="px-5 pb-0">
        <CardTitle className="text-lg">Version History</CardTitle>
        <p className="text-sm text-muted-foreground">
          Timeline of configuration changes
        </p>
      </CardHeader>
      <CardContent className="px-5">
        <ol className="space-y-4">
          {versionHistory.map((item, idx) => (
            <li key={item.title} className="relative pl-6">
              <span className="absolute top-1 left-0 size-2 rounded-full bg-primary" />
              {idx < versionHistory.length - 1 ? (
                <span className="absolute top-3 left-[3px] h-[calc(100%+8px)] w-px bg-border" />
              ) : null}
              <p className="text-sm font-semibold leading-tight">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.date}</p>
              <div className="mt-2 rounded-md bg-muted/60 p-2.5">
                <p className="text-xs font-medium">{item.author}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.details}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
