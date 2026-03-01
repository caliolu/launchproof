import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import type { IdeaSummary } from "@/types/ai";

interface IdeaSummaryCardProps {
  idea: IdeaSummary;
}

export function IdeaSummaryCard({ idea }: IdeaSummaryCardProps) {
  return (
    <Card className="border-success/50 bg-success/5 animate-[fadeIn_0.3s_ease-out]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckCircle2 className="h-5 w-5 text-success" />
          Idea captured: {idea.productName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="font-medium">{idea.oneLiner}</p>

        <div>
          <span className="text-muted-foreground">Problem: </span>
          {idea.problemStatement}
        </div>

        <div>
          <span className="text-muted-foreground">Audience: </span>
          {idea.targetAudience}
        </div>

        <div>
          <span className="text-muted-foreground">Value Prop: </span>
          {idea.valueProposition}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {idea.keyFeatures.map((feature, i) => (
            <Badge key={i} variant="secondary">
              {feature}
            </Badge>
          ))}
        </div>

        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>Industry: {idea.industry}</span>
          <span>Model: {idea.monetizationModel}</span>
          <span>CTA: {idea.ctaText}</span>
        </div>
      </CardContent>
    </Card>
  );
}
