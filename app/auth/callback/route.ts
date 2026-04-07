import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // For email verification failures, show the error state instead of /login
  if (next === "/email-verified") {
    return NextResponse.redirect(`${origin}/email-verified?error=expired`);
  }

  // Default fallback for other flows
  return NextResponse.redirect(`${origin}/login`);
}
