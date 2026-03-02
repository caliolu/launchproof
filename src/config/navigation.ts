import {
  LayoutDashboard,
  MessageSquare,
  Globe,
  Megaphone,
  BarChart3,
  Settings,
  CreditCard,
  Bell,
  Radar,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const platformNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Discover", href: "/discover", icon: Radar },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const projectTabs: NavItem[] = [
  { label: "Dashboard", href: "", icon: BarChart3 },
  { label: "AI Coach", href: "/chat", icon: MessageSquare },
  { label: "Landing Page", href: "/landing-page", icon: Globe },
  { label: "Ads", href: "/ads", icon: Megaphone },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Market Research", href: "/market-research", icon: TrendingUp },
];

export const settingsNav: NavItem[] = [
  { label: "Account", href: "/settings", icon: Settings },
  { label: "Billing", href: "/settings/billing", icon: CreditCard },
  { label: "Notifications", href: "/settings/notifications", icon: Bell },
];
