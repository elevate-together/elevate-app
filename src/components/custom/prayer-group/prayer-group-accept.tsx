"use client";

import { Button } from "@/components/ui/button";
import { acceptUserPrayerGroupStatus } from "@/services/user-prayer-group";
import { Check, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type PrayerGroupAcceptProps = {
  userId: string;
  groupId: string;
  groupName?: string;
};

export default function PrayerGroupAccept({
  userId,
  groupId,
  groupName,
}: PrayerGroupAcceptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const acceptUser = async () => {
    setIsLoading(true);
    const res = await acceptUserPrayerGroupStatus(userId, groupId, groupName);

    if (res.success) {
      router.refresh();
    } else {
      toast.error(res.message);
    }

    setIsLoading(false);
  };

  return (
    <Button
      size="icon"
      onClick={acceptUser}
      disabled={isLoading}
      variant="ghost"
    >
      {isLoading ? <Loader className="spinner animate-spin" /> : <Check />}
    </Button>
  );
}
