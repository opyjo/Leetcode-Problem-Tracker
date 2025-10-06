"use client";

import { Textarea } from "@/components/ui/textarea";

interface MarkdownEditorProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly readOnly?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your approach here...",
  readOnly = false,
}: MarkdownEditorProps) {
  if (readOnly) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50 whitespace-pre-wrap">
        {value || "No content"}
      </div>
    );
  }

  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={8}
      className="font-mono text-sm"
    />
  );
}
