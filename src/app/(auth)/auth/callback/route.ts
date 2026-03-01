import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/services/email";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Send welcome email for new users (async, don't block redirect)
      sendWelcomeEmailIfNew(supabase).catch(() => {});
      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendWelcomeEmailIfNew(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Check if user was just created (within last 60 seconds)
  const createdAt = new Date(user.created_at);
  const now = new Date();
  if (now.getTime() - createdAt.getTime() > 60_000) return;

  const name = user.user_metadata?.full_name || user.email?.split("@")[0];
  await sendWelcomeEmail(user.email!, name);

  // Log email
  const admin = createAdminClient();
  await admin.from("email_logs").insert({
    user_id: user.id,
    email_type: "welcome",
    recipient: user.email!,
    status: "sent",
  });
}
