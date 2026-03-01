import { NextRequest } from "next/server";
import { getStripe } from "@/lib/services/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription && session.customer) {
        const sub = await getStripe().subscriptions.retrieve(
          session.subscription as string
        ) as Stripe.Subscription;
        const customerId = session.customer as string;

        // Find user by stripe_customer_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          const priceId = sub.items.data[0]?.price?.id;
          const plan = getPlanFromPriceId(priceId);

          await supabase.from("subscriptions").upsert(
            {
              user_id: profile.id,
              stripe_subscription_id: sub.id,
              stripe_price_id: priceId,
              status: "active",
              current_period_start: new Date((sub as unknown as { current_period_start: number }).current_period_start * 1000).toISOString(),
              current_period_end: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
            },
            { onConflict: "user_id" }
          );

          await supabase
            .from("profiles")
            .update({ plan })
            .eq("id", profile.id);
        }
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subObj = event.data.object as unknown as {
        id: string;
        customer: string;
        status: string;
        items: { data: Array<{ price: { id: string } }> };
        current_period_start: number;
        current_period_end: number;
        cancel_at: number | null;
        canceled_at: number | null;
      };
      const customerId = subObj.customer;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profile) {
        const status = mapSubscriptionStatus(subObj.status);
        const priceId = subObj.items.data[0]?.price?.id;
        const plan = subObj.status === "active" ? getPlanFromPriceId(priceId) : "free";

        await supabase
          .from("subscriptions")
          .update({
            status,
            stripe_price_id: priceId,
            current_period_start: new Date(subObj.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subObj.current_period_end * 1000).toISOString(),
            cancel_at: subObj.cancel_at
              ? new Date(subObj.cancel_at * 1000).toISOString()
              : null,
            canceled_at: subObj.canceled_at
              ? new Date(subObj.canceled_at * 1000).toISOString()
              : null,
          })
          .eq("stripe_subscription_id", subObj.id);

        await supabase
          .from("profiles")
          .update({ plan })
          .eq("id", profile.id);
      }
      break;
    }
  }

  return Response.json({ received: true });
}

function getPlanFromPriceId(priceId?: string): "free" | "starter" | "pro" {
  if (!priceId) return "free";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID) return "starter";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) return "pro";
  return "free";
}

function mapSubscriptionStatus(status: string): "active" | "inactive" | "trialing" | "past_due" | "canceled" | "unpaid" {
  const map: Record<string, "active" | "inactive" | "trialing" | "past_due" | "canceled" | "unpaid"> = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "unpaid",
  };
  return map[status] || "inactive";
}
