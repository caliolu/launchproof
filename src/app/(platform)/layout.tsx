import { PlatformSidebar } from "@/components/layout/platform-sidebar";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <PlatformSidebar />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
