import { LoginBranding } from "@/containers/login-page/LoginBranding"
import { SignUpForm } from "./SignUpForm"

export function SignUpLayout() {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[1fr_1fr]">
      <LoginBranding />
      <SignUpForm />
    </div>
  )
}
