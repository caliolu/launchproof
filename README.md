# LaunchProof

AI-powered idea validation platform for entrepreneurs. Describe your startup idea, get a landing page, run ads, collect signups, and measure real demand — all without writing code.

## Features

### Phase 1 — Idea Validation
- **AI Idea Coach** — 6-phase guided conversation to extract your idea's core: problem, audience, value prop, monetization, and tone
- **Landing Page Generator** — AI-generated landing pages with 4 templates (Minimal, Bold, Corporate, Dark), custom colors, and instant publishing
- **AI Ad Strategist** — Multi-channel ad copy for Google Search, Facebook, Instagram, Reddit, and Twitter with smart channel recommendations
- **Signup Capture** — Collect real email signups from your published landing page with UTM tracking and location data
- **Validation Score** — Composite score (0-100) based on conversion rate, traffic volume, engagement, and signup quality
- **Analytics Dashboard** — Page views, unique visitors, signups, conversion rate, traffic sources, device breakdown, daily trends

### Phase 2 — SaaS Opportunity Scanner (Pro)
- **Reddit Demand Mining** — Scrapes 10+ SaaS subreddits for demand signals: pain points, feature requests, urgency, and willingness to pay
- **Review Analysis** — Analyzes negative reviews from G2, Capterra, Product Hunt, and Trustpilot to find competitor weaknesses and feature gaps
- **Opportunity Scoring** — Cross-references demand + weakness signals and scores across 5 dimensions: demand, weakness, frequency, WTP, feasibility
- **AI Product Briefs** — Auto-generated briefs with target personas, MVP features, pricing strategy, GTM plan, and competitive landscape
- **Market Research** — Per-project analysis showing how market opportunities relate to your specific idea with fit scoring
- **Create from Opportunity** — One-click project creation from any discovered opportunity, pre-filled with market data
- **AI Coach Integration** — Coach references market intelligence when advising on your idea
- **Favorites & Notes** — Save, annotate, and track opportunity status (new → researching → validated → building)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **Auth**: Supabase Auth
- **AI**: Anthropic Claude (claude-sonnet-4-20250514)
- **Image Gen**: fal.ai
- **Billing**: Stripe (Free / Starter / Pro tiers)
- **Email**: Resend
- **Deploy**: Vercel (auto-deploy from GitHub)

## Pricing

| Plan | Price | Key Limits |
|------|-------|-----------|
| Free | $0 | 1 project, AI Coach, landing page preview only |
| Starter | $29/test | 1 project, publish + collect up to 100 signups, ads |
| Pro | $79/month | Unlimited projects & signups, Opportunity Scanner, Market Research |

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, signup, password reset
│   ├── (marketing)/      # Landing page, pricing
│   ├── (platform)/       # Dashboard, projects, discover, settings
│   │   ├── dashboard/    # Project list
│   │   ├── discover/     # Opportunity Scanner browser
│   │   ├── project/      # Per-project: chat, landing page, ads, analytics, market research
│   │   └── settings/     # Account, billing, notifications
│   ├── api/
│   │   ├── ai/           # Chat, landing page, ads, image generation
│   │   ├── scanner/      # Scan, jobs, opportunities, annotations, market research
│   │   ├── projects/     # CRUD
│   │   ├── landing-pages/ # Landing page management
│   │   ├── signups/      # Public signup capture
│   │   ├── analytics/    # Metrics
│   │   ├── billing/      # Stripe checkout/portal
│   │   └── webhooks/     # Stripe webhooks
│   └── lp/[slug]/        # Public landing page renderer
├── components/
│   ├── scanner/          # Opportunity cards, filters, scan dialog, score breakdown
│   ├── chat/             # Chat interface, messages, typing indicator
│   ├── landing-page/     # Editor, preview, templates
│   ├── dashboard/        # Project cards, metrics, charts
│   └── ui/               # Button, Card, Badge, Dialog, etc.
├── config/               # Plans, navigation, scanner defaults
├── hooks/                # useChat, useProject, useSubscription, useOpportunities, useScanJob
├── lib/
│   ├── ai/               # Claude client, prompts, tools, Zod schemas
│   ├── services/         # Scrapers (Reddit, reviews), scanner pipeline, email, Stripe
│   ├── supabase/         # Server/client/admin clients
│   ├── validation/       # Score calculator, metrics aggregation
│   └── utils/            # Errors, rate limiting, slugify, formatting
├── types/                # Database, scanner, AI, analytics, landing page, ads, billing
└── styles/               # Tailwind v4 globals
```

## Database

5 migrations covering 17+ tables:
- `00001` — Core tables (profiles, projects, chat, landing pages, ads, signups, page views)
- `00002` — RLS policies
- `00003` — Functions & triggers
- `00004` — Analytics views
- `00005` — Opportunity Scanner (scan jobs, reddit/review signals, opportunities, annotations, market research)

## Environment Variables

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI (required)
ANTHROPIC_API_KEY=

# Image generation (required)
FAL_KEY=

# Billing (required for paid features)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=

# Email (optional)
RESEND_API_KEY=

# Keyword research (optional, falls back to mock)
DATAFORSEO_LOGIN=
DATAFORSEO_PASSWORD=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_LANDING_PAGE_DOMAIN=localhost:3000
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## License

Private — All rights reserved.
