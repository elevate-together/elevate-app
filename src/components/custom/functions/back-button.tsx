"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

import { usePathname, useRouter } from "next/navigation";

export default function BackButton({ ...props }) {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <Button
      {...props}
      variant="ghost"
      size="icon"
      className="w-6 h-6 "
      onClick={() => router.back()}
    >
      <ChevronLeft />
    </Button>
  );
}
