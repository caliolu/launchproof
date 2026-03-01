"use client";

import type { LandingPageContent, ColorScheme } from "@/types/landing-page";

interface TemplateDarkProps {
  content: LandingPageContent;
  colors: ColorScheme;
  onSignup?: (email: string) => void;
}

export function TemplateDark({ content, colors, onSignup }: TemplateDarkProps) {
  const bg = colors.background;
  const text = colors.text;

  return (
    <div style={{ background: bg, color: text }} className="min-h-screen">
      <section className="py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex px-3 py-1 rounded-full text-xs font-medium mb-6" style={{ background: `${colors.primary}20`, color: colors.primary }}>
            Now in early access
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">{content.hero.headline}</h1>
          <p className="text-lg opacity-60 mb-10 max-w-xl mx-auto">{content.hero.subheadline}</p>
          <DarkSignup ctaText={content.hero.ctaText} colors={colors} onSignup={onSignup} />
        </div>
      </section>

      {content.hero.imageUrl && (
        <section className="px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.hero.imageUrl} alt="Product preview" className="rounded-2xl border border-white/10 shadow-2xl" />
          </div>
        </section>
      )}

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: colors.primary }}>{content.problem.title}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {content.problem.painPoints.map((p, i) => (
              <div key={i} className="p-5 rounded-xl border border-white/10" style={{ background: `${colors.primary}08` }}>
                <p className="text-sm">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{content.solution.title}</h2>
          <p className="opacity-60 mb-12 max-w-xl mx-auto">{content.solution.description}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {content.solution.features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/10 text-left" style={{ background: `${colors.primary}06` }}>
                <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center text-sm font-bold" style={{ background: colors.primary, color: bg }}>
                  {i + 1}
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm opacity-60">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 text-center" style={{ background: `linear-gradient(180deg, transparent, ${colors.primary}15)` }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">{content.cta.headline}</h2>
          <p className="opacity-60 mb-8">{content.cta.description}</p>
          <DarkSignup ctaText={content.cta.buttonText} colors={colors} onSignup={onSignup} />
        </div>
      </section>

      <footer className="py-8 px-4 text-center text-xs opacity-30">Powered by LaunchProof</footer>
    </div>
  );
}

function DarkSignup({ ctaText, colors, onSignup }: { ctaText: string; colors: ColorScheme; onSignup?: (email: string) => void }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); const email = new FormData(e.currentTarget).get("email") as string; onSignup?.(email); e.currentTarget.reset(); }}
      className="flex gap-2 max-w-md mx-auto"
    >
      <input type="email" name="email" required placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg border text-sm" style={{ borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: colors.text }} />
      <button type="submit" className="px-6 py-3 rounded-lg font-semibold text-sm cursor-pointer" style={{ background: colors.primary, color: colors.background }}>{ctaText}</button>
    </form>
  );
}
