import { Button } from "@/components/ui/button";
import { addUserToPrayerGroup } from "@/services/user-prayer-group";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ButtonProps } from "@/components/ui/button";

type JoinGroupProps = ButtonProps & {
  userId: string;
  groupId: string;
  onClose?: () => void;
  requestToJoin?: boolean;
};

export default function UserJoinGroup({
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
    } catch (error) {
      console.error("An error occurred:", error);
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
