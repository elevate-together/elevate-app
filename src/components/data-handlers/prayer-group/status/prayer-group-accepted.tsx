"use client";
import { Home } from "lucide-react";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { NoDataDisplay } from "@/components/common";

type PrayerGroupAcceptedProps = {
  groupId: string;
};
export function PrayerGroupAccepted({ groupId }: PrayerGroupAcceptedProps) {
  const router = useRouter();
  return (
    <NoDataDisplay
      title="Youre Already In This Group!"
      subtitle="Click below to view the group's home page."
      icon="Users"
      redirectButton={
        <Button
          variant="muted"
          onClick={() => router.push(`/group/${groupId}`)}
        >
          <Home />
          Go To Group Home
        </Button>
      }
    />
  );
}
