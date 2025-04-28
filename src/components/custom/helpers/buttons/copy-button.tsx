"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

type CopyButtonProps = {
  text: string;
};

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={handleCopy}
      aria-label="Copy link"
    >
      {copied ? (
        <span className="text-xs font-semibold">
          <Check />
        </span>
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
