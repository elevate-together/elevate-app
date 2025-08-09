"use client";

import { Button, ButtonProps } from "@/components/ui";
import { addUserToPrayerGroup } from "@/services/user-prayer-group";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type JoinGroupProps = ButtonProps & {
  userId: string;
  groupId: string;
  onClose?: () => void;
  requestToJoin?: boolean;
};

export function UserJoinGroup({
  userId,
  groupId,
  onClose,
  requestToJoin = false,
  ...props
}: JoinGroupProps) {
  const router = useRouter();
  const joinGroup = async () => {
    try {
      const response = await addUserToPrayerGroup(userId, groupId);
      if (response.success) {
        if (onClose) {
          onClose();
        }
        router.refresh();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("An unexpected error occurred while joining the group.");
    }
  };

  return (
    <Button className="p-2" onClick={joinGroup} {...props}>
      <Star />
      {requestToJoin ? "Request" : "Join"}
    </Button>
  );
}
