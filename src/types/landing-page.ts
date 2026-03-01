export interface LandingPageContent {
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    imagePrompt: string;
    imageUrl?: string;
  };
  problem: {
    title: string;
    description: string;
    painPoints: string[];
  };
  solution: {
    title: string;
    description: string;
    features: {
      title: string;
      description: string;
      icon?: string;
    }[];
  };
  socialProof?: {
    title: string;
    testimonials: {
      quote: string;
      author: string;
      role: string;
    }[];
  };
  cta: {
    headline: string;
    description: string;
    buttonText: string;
    type: "waitlist" | "preorder" | "demo" | "custom";
  };
  faq?: {
    question: string;
    answer: string;
  }[];
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export type TemplateId = "minimal" | "bold" | "corporate" | "dark";
