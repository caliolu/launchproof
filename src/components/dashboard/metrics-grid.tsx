import { Card, CardContent } from "@/components/ui/card";
import { Eye, Users, TrendingUp, BarChart3 } from "lucide-react";
import { formatNumber, formatPercent } from "@/lib/utils/format";

interface MetricsGridProps {
  pageViews: number;
  uniqueVisitors: number;
  signups: number;
  conversionRate: number;
}

export function MetricsGrid({ pageViews, uniqueVisitors, signups, conversionRate }: MetricsGridProps) {
  const metrics = [
    { label: "Page Views", value: formatNumber(pageViews), icon: Eye },
    { label: "Unique Visitors", value: formatNumber(uniqueVisitors), icon: Users },
    { label: "Signups", value: formatNumber(signups), icon: TrendingUp },
    { label: "Conversion Rate", value: formatPercent(conversionRate), icon: BarChart3 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {metrics.map((m) => (
        <Card key={m.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <m.icon className="h-4 w-4" />
              {m.label}
            </div>
            <p className="text-2xl font-bold">{m.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
