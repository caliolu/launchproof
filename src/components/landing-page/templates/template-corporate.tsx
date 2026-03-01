"use client";

import type { LandingPageContent, ColorScheme } from "@/types/landing-page";

interface TemplateCorporateProps {
  content: LandingPageContent;
  colors: ColorScheme;
  onSignup?: (email: string) => void;
}

export function TemplateCorporate({ content, colors, onSignup }: TemplateCorporateProps) {
  return (
    <div style={{ background: colors.background, color: colors.text, fontFamily: "system-ui, sans-serif" }} className="min-h-screen">
      <nav className="border-b py-4 px-6" style={{ borderColor: `${colors.primary}15` }}>
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <span className="font-bold text-lg" style={{ color: colors.primary }}>
            {content.hero.headline.split(" ").slice(0, 2).join(" ")}
          </span>
        </div>
      </nav>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{content.hero.headline}</h1>
            <p className="text-lg opacity-70 mb-8">{content.hero.subheadline}</p>
            <CorporateSignup ctaText={content.hero.ctaText} colors={colors} onSignup={onSignup} />
          </div>
          {content.hero.imageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={content.hero.imageUrl} alt="Product" className="rounded-xl shadow-md" />
          )}
        </div>
      </section>

      <section className="py-16 px-6" style={{ background: `${colors.primary}05` }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3">{content.problem.title}</h2>
            <p className="opacity-70 max-w-2xl mx-auto">{content.problem.description}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {content.problem.painPoints.map((p, i) => (
              <div key={i} className="p-5 bg-white rounded-lg shadow-sm border" style={{ borderColor: `${colors.primary}10` }}>
                <p className="text-sm">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">{content.solution.title}</h2>
          <p className="opacity-70 mb-12 max-w-2xl mx-auto">{content.solution.description}</p>
          <div className="grid md:grid-cols-3 gap-8">
            {content.solution.features.map((f, i) => (
              <div key={i} className="text-left">
                <div className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center text-white font-bold" style={{ background: colors.primary }}>{i + 1}</div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm opacity-70">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6" style={{ background: colors.primary, color: "#fff" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{content.cta.headline}</h2>
          <p className="opacity-80 mb-8">{content.cta.description}</p>
          <CorporateSignup ctaText={content.cta.buttonText} colors={colors} inverted onSignup={onSignup} />
        </div>
      </section>

      <footer className="py-8 px-6 text-center text-xs opacity-40">Powered by LaunchProof</footer>
    </div>
  );
}

function CorporateSignup({ ctaText, colors, inverted, onSignup }: { ctaText: string; colors: ColorScheme; inverted?: boolean; onSignup?: (email: string) => void }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); const email = new FormData(e.currentTarget).get("email") as string; onSignup?.(email); e.currentTarget.reset(); }}
      className="flex gap-2 max-w-md mx-auto"
    >
      <input type="email" name="email" required placeholder="Work email" className="flex-1 px-4 py-3 rounded-lg border text-sm" style={{ borderColor: inverted ? "rgba(255,255,255,0.3)" : `${colors.primary}30`, background: inverted ? "rgba(255,255,255,0.1)" : "#fff", color: inverted ? "#fff" : colors.text }} />
      <button type="submit" className="px-6 py-3 rounded-lg font-semibold text-sm cursor-pointer" style={{ background: inverted ? "#fff" : colors.primary, color: inverted ? colors.primary : "#fff" }}>{ctaText}</button>
    </form>
  );
}
