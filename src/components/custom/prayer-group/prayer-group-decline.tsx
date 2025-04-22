"use client";

import { Button } from "@/components/ui/button";
import { removeUserFromPrayerGroup } from "@/services/user-prayer-group";
import { PrayerGroup } from "@prisma/client";
import { Loader, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type PrayerGroupRemoveProps = {
  userId: string;
  prayerGroup: PrayerGroup;
};

export default function PrayerGroupDecline({
  userId,
  prayerGroup,
}: PrayerGroupRemoveProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const declineUser = async () => {
    setIsLoading(true);
    const res = await removeUserFromPrayerGroup(
      userId,
      prayerGroup.id,
      prayerGroup.ownerId
    );

    if (res.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }

    setIsLoading(false);
  };

  return (
    <Button
      onClick={declineUser}
      disabled={isLoading}
      variant="ghost"
      size="icon"
    >
      {isLoading ? <Loader className="spinner animate-spin" /> : <X />}
    </Button>
  );
}
