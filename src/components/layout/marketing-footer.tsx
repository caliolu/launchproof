import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src="/logo.svg" alt="" className="h-6 w-6" />
              <span className="font-bold">Launch<span className="text-primary">Proof</span></span>
            </div>
            <p className="text-sm text-muted-foreground">
              Validate your startup idea in 24 hours with AI-powered tools and real market data.
            </p>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Product</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-foreground transition-colors">How it Works</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Account</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground transition-colors">Log in</Link></li>
              <li><Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Legal</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>LaunchProof. Validate fast. Build what matters.</p>
          <p>Built with Next.js, Supabase & Claude AI</p>
        </div>
      </div>
    </footer>
  );
}
