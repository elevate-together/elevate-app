"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export default function PrayerGroupView({ id }: { id: string }) {
  const router = useRouter();
  return (
    <Button
      size="icon"
      variant="secondary"
      onClick={() => {
        router.push(`/groups/${id}`);
      }}
    >
      <ChevronRight />
    </Button>
  );
}
