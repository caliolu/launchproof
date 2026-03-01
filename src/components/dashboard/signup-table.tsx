"use client";

import { formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";

interface Signup {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  ip_country: string | null;
  created_at: string;
}

interface SignupTableProps {
  signups: Signup[];
  hiddenCount?: number;
}

export function SignupTable({ signups, hiddenCount = 0 }: SignupTableProps) {
  if (signups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No signups yet. Share your landing page to start collecting interest.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      {hiddenCount > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center justify-between">
          <span>+{hiddenCount} more signup{hiddenCount > 1 ? "s" : ""} collected! Upgrade to Pro to unlock all your signups.</span>
          <a href="/settings/billing" className="font-medium underline whitespace-nowrap ml-4">Upgrade</a>
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-2 font-medium text-muted-foreground">Email</th>
            <th className="pb-2 font-medium text-muted-foreground">Name</th>
            <th className="pb-2 font-medium text-muted-foreground">Source</th>
            <th className="pb-2 font-medium text-muted-foreground">Country</th>
            <th className="pb-2 font-medium text-muted-foreground">Date</th>
          </tr>
        </thead>
        <tbody>
          {signups.map((s) => (
            <tr key={s.id} className="border-b border-border/50">
              <td className="py-2.5">{s.email}</td>
              <td className="py-2.5">{s.name || "—"}</td>
              <td className="py-2.5">
                {s.source ? (
                  <Badge variant="secondary">{s.source}</Badge>
                ) : (
                  "Direct"
                )}
              </td>
              <td className="py-2.5">{s.ip_country || "—"}</td>
              <td className="py-2.5 text-muted-foreground">{formatDate(s.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
