"use client";

import { useEffect, useState } from "react";
import { TemplateRenderer } from "@/components/landing-page/templates/template-renderer";
import type { LandingPageContent, ColorScheme, TemplateId } from "@/types/landing-page";

interface PublicLandingPageProps {
  landingPageId: string;
  projectId: string;
  template: TemplateId;
  content: Record<string, unknown>;
  colors: Record<string, string>;
  showWatermark?: boolean;
}

export function PublicLandingPage({
  landingPageId,
  projectId,
  template,
  content,
  colors,
  showWatermark = false,
}: PublicLandingPageProps) {
  const [submitted, setSubmitted] = useState(false);

  // Track page view on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    fetch("/api/signups", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "page_view",
        landingPageId,
        projectId,
        source: params.get("utm_source"),
        medium: params.get("utm_medium"),
        campaign: params.get("utm_campaign"),
        referrer: document.referrer,
      }),
    }).catch(() => {});
  }, [landingPageId, projectId]);

  async function handleSignup(email: string) {
    const params = new URLSearchParams(window.location.search);
    try {
      await fetch("/api/signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landingPageId,
          projectId,
          email,
          source: params.get("utm_source"),
          medium: params.get("utm_medium"),
          campaign: params.get("utm_campaign"),
          referrer: document.referrer,
        }),
      });
      setSubmitted(true);
    } catch {
      // Silent fail for public page
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: (colors as unknown as ColorScheme).background, color: (colors as unknown as ColorScheme).text }}>
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold mb-3">You&apos;re in!</h1>
          <p className="text-lg opacity-70">We&apos;ll be in touch soon. Thanks for your interest.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TemplateRenderer
        template={template}
        content={content as unknown as LandingPageContent}
        colors={colors as unknown as ColorScheme}
        onSignup={handleSignup}
      />
      {showWatermark && (
        <a
          href="https://launchproof.com"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 bg-black/80 text-white text-xs px-3 py-1.5 rounded-full shadow-lg hover:bg-black/90 transition-colors z-50"
        >
          Built with LaunchProof
        </a>
      )}
    </>
  );
}
