"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { platformNav } from "@/config/navigation";
import { Plus, LogOut } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";

export function PlatformSidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useUser();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0">
      <div className="p-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.svg" alt="" className="h-7 w-7" />
          <span className="text-lg font-bold">Launch<span className="text-primary">Proof</span></span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {platformNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}

        <Link
          href="/project/new"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New project
        </Link>
      </nav>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {profile?.full_name?.[0] || profile?.email?.[0] || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile?.full_name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
