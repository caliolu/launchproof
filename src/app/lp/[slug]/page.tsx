import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { PublicLandingPage } from "./public-landing-page";
import { getPlan } from "@/config/plans";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("landing_pages")
    .select("meta_title, meta_description, og_image_url")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!data) return {};

  return {
    title: data.meta_title || "LaunchProof",
    description: data.meta_description || "",
    openGraph: {
      title: data.meta_title || "LaunchProof",
      description: data.meta_description || "",
      images: data.og_image_url ? [data.og_image_url] : [],
    },
  };
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: page } = await supabase
    .from("landing_pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!page) notFound();

  // Check if the page owner's plan requires a watermark
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", page.user_id)
    .single();

  const plan = getPlan(profile?.plan || "free");
  const showWatermark = plan.limits.watermark;

  return (
    <PublicLandingPage
      landingPageId={page.id}
      projectId={page.project_id}
      template={page.template as "minimal" | "bold" | "corporate" | "dark"}
      content={page.content as Record<string, unknown>}
      colors={page.color_scheme as Record<string, string>}
      showWatermark={showWatermark}
    />
  );
}
