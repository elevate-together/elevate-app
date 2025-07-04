"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useIsMobile } from "@/components/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { LogOut, X } from "lucide-react";
import { PrayerGroup } from "@prisma/client";
import { removeUserFromPrayerGroup } from "@/services/user-prayer-group";

type UserLeaveGroupProps = {
  group: PrayerGroup;
  userId: string;
  isRequested?: boolean;
};

export default function UserLeaveGroup({
  group,
  userId,
  isRequested = false,
}: UserLeaveGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();

  const handleSubmit = async () => {
    const response = await removeUserFromPrayerGroup(
      userId,
      group.id,
      group.ownerId
    );

    if (response.success) {
      setIsOpen(false);
      router.push("/");
    } else {
      toast.error(response.message);
    }
  };

  const handleCancel = () => setIsOpen(false);

  const title = isRequested
    ? `Are you sure you want to cancel your request to join ${group.name}?`
    : `Are you sure you want to leave ${group.name}?`;

  const description = isRequested ? (
    <p>
      Are you sure that you want to cancel your request to join
      <span className="font-semibold">{group.name}</span>. You can request to
      join later if you change your mind.
    </p>
  ) : (
    <p>
      Leaving <span className="font-semibold">{group.name}</span> will remove
      your access to its information. Any prayer requests you’ve shared with
      this group will be archived and made private to you. You can rejoin later
      if you change your mind.
    </p>
  );

  const confirmText = isRequested ? "Cancel Rewuest" : "Leave Group";

  const triggerButton = isRequested ? (
    <Button variant="destructive" size="icon" onClick={handleSubmit}>
      <X />
    </Button>
  ) : (
    <Button variant="ghost" size="icon" aria-label={title}>
      <LogOut />
    </Button>
  );

  const confirmContent = (
    <div className="flex flex-col gap-4">
      {description}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={handleSubmit}>
          {confirmText}
        </Button>
      </div>
    </div>
  );

  return isMobile ? (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        {confirmContent}
        <DrawerDescription hidden>{title}</DrawerDescription>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {confirmContent}
        <DialogDescription hidden>{title}</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
