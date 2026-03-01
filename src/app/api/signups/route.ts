import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/utils/rate-limit";
import { sendSignupNotification } from "@/lib/services/email";
import { getPlan } from "@/config/plans";

// POST: Record a signup (public, no auth)
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const { success } = rateLimit(`signup:${ip}`, 10, 60_000);
    if (!success) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }

    const { landingPageId, projectId, email, name, source, medium, campaign, referrer } =
      await request.json();

    if (!landingPageId || !projectId || !email) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify landing page is published and get owner info
    const { data: page } = await supabase
      .from("landing_pages")
      .select("id, is_published, user_id")
      .eq("id", landingPageId)
      .single();

    if (!page?.is_published) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    // Check signup limit based on owner's plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", page.user_id)
      .single();

    const plan = getPlan(profile?.plan || "free");
    if (plan.limits.maxSignups < Infinity) {
      const { count } = await supabase
        .from("signups")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);

      if ((count || 0) >= plan.limits.maxSignups) {
        return Response.json({ error: "Signup limit reached" }, { status: 403 });
      }
    }

    const ipCountry = request.headers.get("x-vercel-ip-country") || null;
    const ipCity = request.headers.get("x-vercel-ip-city") || null;
    const userAgent = request.headers.get("user-agent") || null;

    const { error } = await supabase.from("signups").insert({
      landing_page_id: landingPageId,
      project_id: projectId,
      email,
      name: name || null,
      source: source || null,
      medium: medium || null,
      campaign: campaign || null,
      referrer: referrer || null,
      user_agent: userAgent,
      ip_country: ipCountry,
      ip_city: ipCity,
    });

    if (error) {
      if (error.code === "23505") {
        return Response.json({ message: "Already signed up" }, { status: 200 });
      }
      throw error;
    }

    // Send signup notification to project owner (async, don't block response)
    sendSignupNotificationAsync(supabase, projectId, email).catch(() => {});

    return Response.json({ message: "Signup recorded" }, { status: 201 });
  } catch {
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

// PUT: Record a page view (public, no auth)
export async function PUT(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const { success } = rateLimit(`pv:${ip}`, 100, 60_000);
    if (!success) return new Response(null, { status: 204 });

    const { landingPageId, projectId, source, medium, campaign, referrer } =
      await request.json();

    if (!landingPageId || !projectId) return new Response(null, { status: 204 });

    const supabase = createAdminClient();

    const userAgent = request.headers.get("user-agent") || "";
    let deviceType: "desktop" | "tablet" | "mobile" = "desktop";
    if (/mobile/i.test(userAgent)) deviceType = "mobile";
    else if (/tablet|ipad/i.test(userAgent)) deviceType = "tablet";

    await supabase.from("page_views").insert({
      landing_page_id: landingPageId,
      project_id: projectId,
      session_id: crypto.randomUUID(),
      source: source || null,
      medium: medium || null,
      campaign: campaign || null,
      referrer: referrer || null,
      device_type: deviceType,
      ip_country: request.headers.get("x-vercel-ip-country") || null,
    });

    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 204 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendSignupNotificationAsync(supabase: any, projectId: string, signupEmail: string) {
  // Get project info + owner
  const { data: project } = await supabase
    .from("projects")
    .select("name, user_id")
    .eq("id", projectId)
    .single();

  if (!project) return;

  // Check owner notification preferences
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, notification_preferences")
    .eq("id", project.user_id)
    .single();

  if (!profile) return;

  const prefs = profile.notification_preferences as { signup_alerts?: boolean } | null;
  if (prefs && prefs.signup_alerts === false) return;

  // Get signup count
  const { count } = await supabase
    .from("signups")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  await sendSignupNotification(profile.email, project.name, signupEmail, count || 1);

  // Log email
  await supabase.from("email_logs").insert({
    user_id: project.user_id,
    email_type: "signup_notification",
    recipient: profile.email,
    status: "sent",
    metadata: { project_id: projectId, signup_email: signupEmail },
  });
}
