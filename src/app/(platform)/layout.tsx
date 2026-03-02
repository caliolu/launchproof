import { PlatformSidebar } from "@/components/layout/platform-sidebar";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <PlatformSidebar />
      <main className="flex-1 flex flex-col min-w-0">{children}</main>
    </div>
  );
}
