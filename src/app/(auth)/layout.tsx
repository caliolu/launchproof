import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-muted/30">
      <Link href="/" className="text-2xl font-bold text-primary mb-8">
        LaunchProof
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
