import { Button } from "@/components/ui/button";
import { addUserToPrayerGroup } from "@/services/user-prayer-group";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type JoinGroupProps = {
  userId: string;
  groupId: string;
  onClose?: () => void;
};

export default function UserJoinGroup({
  userId,
  groupId,
  onClose,
}: JoinGroupProps) {
  const router = useRouter();
  const joinGroup = async () => {
    try {
      const response = await addUserToPrayerGroup(userId, groupId);
      if (response.success) {
        toast.success(response.message);
        if (onClose) {
          onClose();
        }
        router.refresh();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      toast.error("An unexpected error occurred while joining the group.");
    }
  };

  return (
    <Button className="p-2" onClick={joinGroup}>
      <Star />
      Join
    </Button>
  );
}
