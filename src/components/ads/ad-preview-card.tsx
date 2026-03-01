"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/shared/copy-button";
import { Star } from "lucide-react";
import { getChannel } from "@/config/ad-channels";

interface AdPreviewCardProps {
  channel: string;
  recommended: boolean;
  recommendationReason: string | null;
  content: Record<string, unknown>;
}

export function AdPreviewCard({
  channel,
  recommended,
  recommendationReason,
  content,
}: AdPreviewCardProps) {
  const channelConfig = getChannel(channel);
  if (!channelConfig) return null;

  return (
    <Card className={recommended ? "border-primary/50" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {channelConfig.name}
            {recommended && (
              <Badge variant="success" className="gap-1">
                <Star className="h-3 w-3" />
                Recommended
              </Badge>
            )}
          </CardTitle>
        </div>
        {recommendationReason && (
          <p className="text-xs text-muted-foreground">{recommendationReason}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          {Object.entries(content).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </label>
              <div className="flex items-start gap-2">
                <div className="flex-1 p-2 rounded-md bg-muted text-sm">
                  {Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-1">
                      {(value as string[]).map((v, i) => (
                        <Badge key={i} variant="secondary">{String(v)}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{String(value)}</p>
                  )}
                </div>
                {typeof value === "string" && (
                  <CopyButton text={value} />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
