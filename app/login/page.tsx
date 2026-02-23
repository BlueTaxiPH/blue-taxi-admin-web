import type { Metadata } from "next"
import LoginPageSection from "@/containers/login-page"

export const metadata: Metadata = {
  title: "Sign In | Blue Taxi Admin",
  description: "Sign in to the Blue Taxi admin dashboard",
}

export default function LoginPage() {
  return <LoginPageSection />
}
