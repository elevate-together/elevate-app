"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { HelpingHand } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserViewPrayer({
  id,
  ...props
}: { id: string } & ButtonProps) {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      onClick={() => {
        router.push(`/requests/${id}`);
      }}
      {...props}
    >
      <HelpingHand />
      Prayer Requests
    </Button>
  );
}
