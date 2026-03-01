"use client";

import type { LandingPageContent, ColorScheme } from "@/types/landing-page";

interface TemplateMinimalProps {
  content: LandingPageContent;
  colors: ColorScheme;
  onSignup?: (email: string) => void;
}

export function TemplateMinimal({ content, colors, onSignup }: TemplateMinimalProps) {
  return (
    <div style={{ background: colors.background, color: colors.text }} className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {content.hero.headline}
          </h1>
          <p className="text-lg opacity-70 mb-8 max-w-xl mx-auto">
            {content.hero.subheadline}
          </p>
          {content.hero.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.hero.imageUrl}
              alt="Hero"
              className="rounded-xl shadow-lg mx-auto mb-8 max-w-full"
            />
          )}
          <SignupForm ctaText={content.hero.ctaText} colors={colors} onSignup={onSignup} />
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 px-4" style={{ background: `${colors.primary}08` }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">{content.problem.title}</h2>
          <p className="opacity-70 mb-6">{content.problem.description}</p>
          <ul className="space-y-3">
            {content.problem.painPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors.secondary }} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-2 text-center">{content.solution.title}</h2>
          <p className="opacity-70 mb-10 text-center max-w-xl mx-auto">{content.solution.description}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {content.solution.features.map((feature, i) => (
              <div key={i} className="p-5 rounded-xl border" style={{ borderColor: `${colors.primary}20` }}>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm opacity-70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      {content.socialProof && (
        <section className="py-16 px-4" style={{ background: `${colors.primary}08` }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">{content.socialProof.title}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {content.socialProof.testimonials.map((t, i) => (
                <div key={i} className="p-5 rounded-xl bg-white shadow-sm">
                  <p className="text-sm italic mb-3">&ldquo;{t.quote}&rdquo;</p>
                  <p className="text-sm font-semibold">{t.author}</p>
                  <p className="text-xs opacity-60">{t.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {content.faq && content.faq.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {content.faq.map((item, i) => (
                <div key={i} className="border-b pb-4" style={{ borderColor: `${colors.primary}15` }}>
                  <h3 className="font-semibold mb-2">{item.question}</h3>
                  <p className="text-sm opacity-70">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4" style={{ background: colors.primary, color: "#fff" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">{content.cta.headline}</h2>
          <p className="opacity-80 mb-8">{content.cta.description}</p>
          <SignupForm ctaText={content.cta.buttonText} colors={colors} inverted onSignup={onSignup} />
        </div>
      </section>

      <footer className="py-8 px-4 text-center text-xs opacity-50">
        Powered by LaunchProof
      </footer>
    </div>
  );
}

function SignupForm({
  ctaText,
  colors,
  inverted,
  onSignup,
}: {
  ctaText: string;
  colors: ColorScheme;
  inverted?: boolean;
  onSignup?: (email: string) => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const email = new FormData(form).get("email") as string;
        onSignup?.(email);
        form.reset();
      }}
      className="flex gap-2 max-w-md mx-auto"
    >
      <input
        type="email"
        name="email"
        required
        placeholder="Enter your email"
        className="flex-1 px-4 py-3 rounded-lg border text-sm"
        style={{
          borderColor: inverted ? "rgba(255,255,255,0.3)" : `${colors.primary}30`,
          background: inverted ? "rgba(255,255,255,0.15)" : colors.background,
          color: inverted ? "#fff" : colors.text,
        }}
      />
      <button
        type="submit"
        className="px-6 py-3 rounded-lg font-medium text-sm cursor-pointer"
        style={{
          background: inverted ? "#fff" : colors.primary,
          color: inverted ? colors.primary : "#fff",
        }}
      >
        {ctaText}
      </button>
    </form>
  );
}
