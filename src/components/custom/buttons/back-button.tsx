"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation"; // To check the current route

export const BackButton = ({ ...props }) => {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <Button
      {...props}
      variant="ghost"
      size="icon"
      onClick={() => router.back()}
    >
      <ChevronLeft />
    </Button>
  );
};
