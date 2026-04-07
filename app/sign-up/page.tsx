import type { Metadata } from "next"

import { SignUpSection } from "@/containers/sign-up"

export const metadata: Metadata = {
  title: "Request Access | Blue Taxi Admin",
}

export default function SignUpPage() {
  return <SignUpSection />
}
