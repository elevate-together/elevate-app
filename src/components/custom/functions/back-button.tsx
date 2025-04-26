"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

import { useRouter } from "next/navigation";

export default function BackButton({ ...props }) {
  const router = useRouter();

  return (
    <Button
      className="text-md p-2  h-9"
      variant="ghost"
      onClick={() => router.back()}
      {...props}
    >
      <ChevronLeft />
      <span>Back</span>
    </Button>
  );
}
