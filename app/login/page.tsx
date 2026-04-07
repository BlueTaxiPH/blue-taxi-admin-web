import type { Metadata } from "next"
import LoginPageSection from "@/containers/login-page"

export const metadata: Metadata = {
  title: "Sign In | Blue Taxi Admin",
  description: "Sign in to the Blue Taxi admin dashboard",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  return <LoginPageSection initialStatus={status} />
}
