import { LoginBranding } from "@/containers/login-page/LoginBranding"
import { LoginForm } from "@/containers/login-page/LoginForm"

export function LoginLayout({ initialStatus }: { initialStatus?: string }) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[1fr_1fr]">
      <LoginBranding />
      <LoginForm initialStatus={initialStatus} />
    </div>
  )
}
