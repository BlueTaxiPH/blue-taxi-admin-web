"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { resendDriverInvite } from "@/app/actions/resend-driver-invite"

export function ResendInviteButton({ email }: { email: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function handleResend() {
    setFeedback(null)
    setIsLoading(true)
    const result = await resendDriverInvite(email)
    setIsLoading(false)

    if (result.success) {
      setFeedback({ type: "success", text: `Invite resent to ${email}` })
      router.refresh()
    } else {
      setFeedback({ type: "error", text: result.error })
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        size="sm"
        variant="outline"
        onClick={handleResend}
        disabled={isLoading}
        className="gap-1.5"
      >
        <Mail className="size-3.5" aria-hidden />
        {isLoading ? "Sending…" : "Resend Invite"}
      </Button>
      {feedback ? (
        <p className={`text-xs ${feedback.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {feedback.text}
        </p>
      ) : null}
    </div>
  )
}
