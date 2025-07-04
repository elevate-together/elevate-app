"use client";

import { useIsMobile } from "@/components/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Loader, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteReminder } from "@/services/reminder";

type ReminderDeleteProps = {
  userId: string;
  reminderId: string;
  includeText?: boolean;
  className?: string;
};

export default function ReminderDelete({
  userId,
  reminderId,
  includeText = false,
  className = "",
}: ReminderDeleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
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

  const dialogTitle = "Are you sure you want to delete this reminder?";
  const dialogDescription =
    "This action cannot be undone. This will permanently delete your reminder.";
  const buttonLabel = includeText ? "Delete" : "";

  const triggerButton = (
    <Button
      size={includeText ? "default" : "icon"}
      aria-label="Delete prayer request"
      className={className}
      variant="destructiveNoOutline"
    >
      <Trash />
      {buttonLabel}
    </Button>
  );

  const cancelButton = (
    <Button className="flex-1" variant="secondary" disabled={loading}>
      Cancel
    </Button>
  );

  const submitButton = (
    <Button
      className="flex-1"
      type="submit"
      onClick={handleDeleteRequest}
      disabled={loading}
    >
      {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Confirm"}
    </Button>
  );

  return isMobile ? (
    <Drawer open={isOpen && isMobile} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{dialogTitle}</DrawerTitle>
          <DrawerDescription>{dialogDescription}</DrawerDescription>
        </DrawerHeader>

        <DrawerFooter className="flex flex-row px-0 mb-7">
          <DrawerClose asChild>{cancelButton}</DrawerClose>
          {submitButton}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen && !isMobile} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>

      <DialogContent className="w-full max-w-sm">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-left">
          {dialogDescription}
        </DialogDescription>
        <DialogFooter className="flex flex-row">
          <DialogClose asChild>{cancelButton}</DialogClose>
          {submitButton}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
