import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, getOrCreateCustomer } from "@/lib/services/stripe";
import { errorResponse, AuthError, ValidationError } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthError();

    const { priceId } = await request.json();
    if (!priceId) throw new ValidationError("Price ID required");

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile) throw new AuthError();

    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      customerId = await getOrCreateCustomer(user.id, profile.email);
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL!;
    const session = await createCheckoutSession(
      customerId,
      priceId,
      `${origin}/settings/billing?success=true`,
      `${origin}/settings/billing?canceled=true`
    );

    return Response.json({ url: session.url });
  } catch (error) {
    return errorResponse(error);
  }
}
