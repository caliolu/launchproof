export const siteConfig = {
  name: "LaunchProof",
  description:
    "Validate your startup idea in 24 hours with AI-powered landing pages, ad content, and real market data.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://launchproof.com",
  landingPageDomain:
    process.env.NEXT_PUBLIC_LANDING_PAGE_DOMAIN || "launchproof.com",
  ogImage: "/images/marketing/og.png",
  links: {
    twitter: "https://twitter.com/launchproof",
    github: "https://github.com/launchproof",
  },
};
