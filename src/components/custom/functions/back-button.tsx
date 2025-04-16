"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

import { useRouter } from "next/navigation";

export default function BackButton({ ...props }) {
  const router = useRouter();

  return (
    <Button
      {...props}
      variant="ghost"
      // size="default"
      onClick={() => router.back()}
    >
      <ChevronLeft /> Back
    </Button>
  );
}
