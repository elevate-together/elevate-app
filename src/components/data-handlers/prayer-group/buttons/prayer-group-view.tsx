"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import { House } from "lucide-react";

export function PrayerGroupView({ groupId }: { groupId: string }) {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        router.push(`/group/${groupId}`);
      }}
    >
      <House />
    </Button>
  );
}
