import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Rocket,
  Zap,
  Target,
  BarChart3,
  MessageSquare,
  Megaphone,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-24 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm text-primary mb-6">
          <Zap className="h-4 w-4" />
          Validate in 24 hours, not 24 weeks
        </div>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mb-6">
          Test your startup idea{" "}
          <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">before you build</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
          AI-powered landing pages, ad content, and real market data.
          Know if people want what you&apos;re building — in one day.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/signup">
            <Button size="lg" className="text-base px-8">
              Start validating free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg" className="text-base px-8">
              See pricing
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gradient-to-b from-background to-muted/20 py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary mb-2">FEATURES</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to validate
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From idea to data-driven decision in one seamless workflow.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: MessageSquare,
                title: "AI Idea Coach",
                description:
                  "Guided conversation that extracts your idea's core value, target audience, and positioning through 5 structured phases.",
              },
              {
                icon: Target,
                title: "Landing Page Generator",
                description:
                  "Beautiful, conversion-optimized landing pages generated from your idea in seconds. 4 templates, full customization.",
              },
              {
                icon: Megaphone,
                title: "AI Ad Strategist",
                description:
                  "Ready-to-use ad content for Google, Facebook, Instagram, Reddit, and X. With real keyword data.",
              },
              {
                icon: BarChart3,
                title: "Validation Dashboard",
                description:
                  "Real-time metrics, conversion tracking, and a weighted validation score that tells you if your idea works.",
              },
              {
                icon: Rocket,
                title: "One-Click Publish",
                description:
                  "Publish your landing page instantly on a custom subdomain. Start collecting signups in minutes.",
              },
              {
                icon: Zap,
                title: "Instant Setup",
                description:
                  "No coding, no design skills needed. Go from idea to live test in under 30 minutes.",
              },
            ].map((feature) => (
              <Card key={feature.title} className="border-border/50 hover:-translate-y-0.5 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 p-2.5 mb-4">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-muted/30 py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary mb-2">HOW IT WORKS</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              4 steps to validate your idea
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                step: "1",
                title: "Describe your idea",
                description:
                  "Chat with our AI Coach. It asks the right questions to understand your idea, audience, and value proposition.",
              },
              {
                step: "2",
                title: "Generate your landing page",
                description:
                  "AI creates conversion-optimized copy and a beautiful landing page. Pick a template, customize colors, and publish.",
              },
              {
                step: "3",
                title: "Drive traffic with AI ads",
                description:
                  "Get ready-to-use ad copy for 5 channels with real keyword research data. Launch your test campaign.",
              },
              {
                step: "4",
                title: "Read the results",
                description:
                  "Watch signups roll in. Your validation score tells you whether to build, pivot, or move on.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof / stats */}
      <section className="bg-gradient-to-b from-muted/20 to-background py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "24h", label: "Average validation time" },
              { value: "4", label: "Landing page templates" },
              { value: "5", label: "Ad channels supported" },
              { value: "100%", label: "Free to start" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why LaunchProof */}
      <section className="bg-muted/30 py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Why founders choose LaunchProof</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {[
              "Test ideas before writing a single line of code",
              "AI generates landing pages in seconds, not days",
              "Real keyword data from DataForSEO integration",
              "Weighted validation score removes guesswork",
              "Multi-channel ad content ready to copy & paste",
              "Collect and export signups with one click",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-background to-muted/20 py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to validate your idea?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start for free. No credit card required. Get your first validation results today.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-base px-10">
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
