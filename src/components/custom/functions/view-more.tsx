import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";
import { useState } from "react";

interface ViewMoreDescriptionProps {
  description: string;
  maxLength?: number;
  className?: string;
}

export default function ViewMoreDescription({
  description,
  maxLength = 100,
  className = "",
}: ViewMoreDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const truncatedDescription = description.slice(0, maxLength);
  const isTruncated = description.length > maxLength;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <p>{isExpanded ? description : `${truncatedDescription}...`}</p>
      {isTruncated && (
        <Button
          size="sm"
          variant="secondary"
          className="flex items-center gap-2 w-[100px] m-auto"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
          {isExpanded ? "View Less" : "View More"}
        </Button>
      )}
    </div>
  );
}
