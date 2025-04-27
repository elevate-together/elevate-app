"use client";
import { Home, ShieldX } from "lucide-react";
import NoDataDisplay from "../templates/no-data-display";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PrayerGroupNotIn() {
  const router = useRouter();
  return (
    <NoDataDisplay
      title="You're not a part of this group!"
      subtitle="You're not part of this group yet. To ensure the privacy and security of the prayer requests shared within, please send a request to the group owner if you'd like to join."
      icon={ShieldX}
      redirectButton={
        <Button variant="muted" onClick={() => router.push("/")}>
          <Home />
          Go Back Home
        </Button>
      }
    />
  );
}
