"use client";
import { Home, Users } from "lucide-react";
import NoDataDisplay from "@/components/custom/templates/helper/no-data-display";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type PrayerGroupAcceptedProps = {
  groupId: string;
};
export default function PrayerGroupAccepted({
  groupId,
}: PrayerGroupAcceptedProps) {
  const router = useRouter();
  return (
    <NoDataDisplay
      title="Youre Already In This Group!"
      subtitle="Click below to view the group's home page."
      icon={Users}
      redirectButton={
        <Button
          variant="muted"
          onClick={() => router.push(`/group/${groupId}`)}
        >
          <Home />
          View Group Home
        </Button>
      }
    />
  );
}
