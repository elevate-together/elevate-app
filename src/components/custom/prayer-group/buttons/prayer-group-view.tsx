"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { House } from "lucide-react";

export default function PrayerGroupView({ id }: { id: string }) {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size='icon'
      onClick={() => {
        router.push(`/group/${id}`);
      }}
    >
      <House />
    </Button>
  );
}
