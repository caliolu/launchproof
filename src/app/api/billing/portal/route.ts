import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPortalSession } from "@/lib/services/stripe";
import { errorResponse, AuthError } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthError();

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      throw new AuthError();
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL!;
    const session = await createPortalSession(
      profile.stripe_customer_id,
      `${origin}/settings/billing`
    );

    return Response.json({ url: session.url });
  } catch (error) {
    return errorResponse(error);
  }
}
