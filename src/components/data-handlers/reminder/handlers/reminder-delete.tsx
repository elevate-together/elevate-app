"use client";
import { Loader, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteReminder } from "@/services/reminder";
import {
  ButtonHandler,
  ButtonHandlerVariant,
  DrawerDialog,
} from "@/components/common";
import { Button } from "@/components/ui";

type ReminderDeleteProps = {
  userId: string;
  reminderId: string;
  variant?: ButtonHandlerVariant;
};

export function ReminderDelete({
  userId,
  reminderId,
  variant,
}: ReminderDeleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDeleteRequest = async () => {
    setLoading(true);
    const result = await deleteReminder({ reminderId, userId });
    if (result.success) {
      setIsOpen(false);
      setTimeout(() => {
        router.refresh();
      }, 100);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const content = (
    <div className="flex gap-2">
      <Button
        className="flex-1"
        onClick={() => setIsOpen(false)}
        disabled={loading}
        variant="secondary"
      >
        Cancel
      </Button>
      <Button
        className="flex-1"
        onClick={handleDeleteRequest}
        disabled={loading}
      >
        {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Confirm"}
      </Button>
    </div>
  );

  const buttonTrigger = (
    <ButtonHandler
      variant={variant}
      icon={Trash}
      title="Delete Reminder"
      onClick={() => setIsOpen(true)}
    />
  );

  return (
    <DrawerDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      content={content}
      title="Are you sure you want to delete this reminder?"
      description="This action cannot be undone. This will permanently delete your reminder."
      buttonTrigger={buttonTrigger}
    />
  );
}
