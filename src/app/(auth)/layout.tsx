import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-primary/5 to-purple-500/5">
      <Link href="/" className="text-2xl font-bold mb-8">
        <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">LaunchProof</span>
      </Link>
      <div className="w-full max-w-md rounded-xl border border-border/50 shadow-[var(--shadow-card)] bg-card p-6">{children}</div>
    </div>
  );
}
