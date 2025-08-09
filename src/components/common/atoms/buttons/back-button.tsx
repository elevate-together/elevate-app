"use client";
import { Button } from "@/components/ui";
import { ChevronLeft } from "lucide-react";

import { useRouter } from "next/navigation";

export function BackButton({ ...props }) {
  const router = useRouter();

  return (
    <Button
      className="text-md p-2 gap-1"
      variant="ghost"
      onClick={() => router.back()}
      {...props}
    >
      <ChevronLeft />
      Back
    </Button>
  );
}
