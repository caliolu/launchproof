"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Save } from "lucide-react";
import type { OpportunityAnnotation, AnnotationStatus } from "@/types/scanner";

interface AnnotationControlsProps {
  annotation: OpportunityAnnotation | null;
  onUpdate?: (data: { isFavorite?: boolean; status?: string; notes?: string }) => void;
}

const STATUS_OPTIONS: { value: AnnotationStatus; label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }[] = [
  { value: "new", label: "New", variant: "secondary" },
  { value: "researching", label: "Researching", variant: "default" },
  { value: "validated", label: "Validated", variant: "success" },
  { value: "building", label: "Building", variant: "success" },
  { value: "dismissed", label: "Dismissed", variant: "destructive" },
];

export function AnnotationControls({ annotation, onUpdate }: AnnotationControlsProps) {
  const [notes, setNotes] = useState(annotation?.notes || "");
  const [isDirty, setIsDirty] = useState(false);

  const currentStatus = annotation?.status || "new";
  const isFavorite = annotation?.is_favorite ?? false;

  function handleNotesChange(value: string) {
    setNotes(value);
    setIsDirty(true);
  }

  function handleSaveNotes() {
    onUpdate?.({ notes });
    setIsDirty(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Favorite + Status */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onUpdate?.({ isFavorite: !isFavorite })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm transition-colors cursor-pointer hover:bg-accent"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
            {isFavorite ? "Favorited" : "Favorite"}
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Status:</span>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onUpdate?.({ status: opt.value })}
                className="cursor-pointer"
              >
                <Badge
                  variant={currentStatus === opt.value ? opt.variant : "outline"}
                  className="cursor-pointer"
                >
                  {opt.label}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add your notes about this opportunity..."
            rows={3}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          {isDirty && (
            <button
              onClick={handleSaveNotes}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:bg-primary/90"
            >
              <Save className="h-3.5 w-3.5" />
              Save Notes
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
