"use client";

import type { LandingPageContent, ColorScheme } from "@/types/landing-page";

interface TemplateBoldProps {
  content: LandingPageContent;
  colors: ColorScheme;
  onSignup?: (email: string) => void;
}

export function TemplateBold({ content, colors, onSignup }: TemplateBoldProps) {
  return (
    <div style={{ background: colors.background, color: colors.text }} className="min-h-screen">
      <section className="py-24 px-4" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, color: "#fff" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">{content.hero.headline}</h1>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">{content.hero.subheadline}</p>
          <InlineSignup ctaText={content.hero.ctaText} onSignup={onSignup} />
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black mb-6" style={{ color: colors.primary }}>{content.problem.title}</h2>
          <p className="text-lg opacity-70 mb-8">{content.problem.description}</p>
          <div className="grid md:grid-cols-2 gap-4">
            {content.problem.painPoints.map((p, i) => (
              <div key={i} className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: `${colors.secondary}40` }}>
                <p className="font-medium">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4" style={{ background: `${colors.primary}08` }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-4">{content.solution.title}</h2>
          <p className="text-lg opacity-70 mb-12 max-w-2xl mx-auto">{content.solution.description}</p>
          <div className="grid md:grid-cols-2 gap-6">
            {content.solution.features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl text-left" style={{ background: colors.background, border: `2px solid ${colors.primary}20` }}>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="opacity-70">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {content.socialProof && (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black mb-10 text-center">{content.socialProof.title}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {content.socialProof.testimonials.map((t, i) => (
                <div key={i} className="p-6 rounded-2xl" style={{ background: `${colors.secondary}10` }}>
                  <p className="italic mb-4">&ldquo;{t.quote}&rdquo;</p>
                  <p className="font-bold">{t.author}</p>
                  <p className="text-sm opacity-60">{t.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-24 px-4" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, color: "#fff" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-4">{content.cta.headline}</h2>
          <p className="text-lg opacity-90 mb-8">{content.cta.description}</p>
          <InlineSignup ctaText={content.cta.buttonText} onSignup={onSignup} />
        </div>
      </section>

      <footer className="py-8 px-4 text-center text-xs opacity-50">Powered by LaunchProof</footer>
    </div>
  );
}

function InlineSignup({ ctaText, onSignup }: { ctaText: string; onSignup?: (email: string) => void }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); const email = new FormData(e.currentTarget).get("email") as string; onSignup?.(email); e.currentTarget.reset(); }}
      className="flex gap-2 max-w-md mx-auto"
    >
      <input type="email" name="email" required placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg text-sm text-black bg-white" />
      <button type="submit" className="px-6 py-3 rounded-lg font-bold text-sm bg-white text-black cursor-pointer">{ctaText}</button>
    </form>
  );
}
