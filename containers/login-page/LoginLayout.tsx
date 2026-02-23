import { LoginBranding } from "@/containers/login-page/LoginBranding"
import { LoginForm } from "@/containers/login-page/LoginForm"
    {/* Left panel width: change 1fr to make it wider (e.g. 1.2fr) or use fixed width (e.g. 420px) */}

export function LoginLayout() {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[1fr_1fr]">
      <LoginBranding />
      <LoginForm />
    </div>
  )
}
