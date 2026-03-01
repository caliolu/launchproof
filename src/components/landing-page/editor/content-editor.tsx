"use client";

import { Input } from "@/components/ui/input";
import type { LandingPageContent } from "@/types/landing-page";

interface ContentEditorProps {
  content: LandingPageContent;
  onChange: (content: LandingPageContent) => void;
}

export function ContentEditor({ content, onChange }: ContentEditorProps) {
  function updateHero(field: string, value: string) {
    onChange({ ...content, hero: { ...content.hero, [field]: value } });
  }

  function updateCta(field: string, value: string) {
    onChange({ ...content, cta: { ...content.cta, [field]: value } });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Hero</h3>
        <div className="space-y-2">
          <label className="text-xs font-medium">Headline</label>
          <Input value={content.hero.headline} onChange={(e) => updateHero("headline", e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium">Subheadline</label>
          <textarea
            value={content.hero.subheadline}
            onChange={(e) => updateHero("subheadline", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium">CTA Button</label>
          <Input value={content.hero.ctaText} onChange={(e) => updateHero("ctaText", e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Problem</h3>
        <div className="space-y-2">
          <label className="text-xs font-medium">Title</label>
          <Input
            value={content.problem.title}
            onChange={(e) => onChange({ ...content, problem: { ...content.problem, title: e.target.value } })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Solution</h3>
        <div className="space-y-2">
          <label className="text-xs font-medium">Title</label>
          <Input
            value={content.solution.title}
            onChange={(e) => onChange({ ...content, solution: { ...content.solution, title: e.target.value } })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Bottom CTA</h3>
        <div className="space-y-2">
          <label className="text-xs font-medium">Headline</label>
          <Input value={content.cta.headline} onChange={(e) => updateCta("headline", e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium">Button Text</label>
          <Input value={content.cta.buttonText} onChange={(e) => updateCta("buttonText", e.target.value)} />
        </div>
      </div>
    </div>
  );
}
