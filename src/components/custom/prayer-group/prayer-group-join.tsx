"use client";

import { useIsMobile } from "@/components/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { PrayerGroupWithOwnerAndCount } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addUserToPrayerGroup } from "@/services/user-prayer-group";
import ActiveLoader from "../functions/active-loader";
import { GroupType } from "@prisma/client";
import UserAvatar from "../user/user-avatar";

type PrayerGroupJoinProps = {
  userId: string;
  group: PrayerGroupWithOwnerAndCount;
};

export default function PrayerGroupJoin({
  userId,
  group,
}: PrayerGroupJoinProps) {
  const [isOpen, setIsOpen] = useState(true);
  const isMobile = useIsMobile();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isPrivate = group.groupType === GroupType.PRIVATE;

  const title = isPrivate
    ? `Confirm Request to Join ${group.name}`
    : `Confirm Join ${group.name}`;
  const description = isPrivate
    ? "This group is private, you must be approved by the owner to join."
    : "By joining, you can share prayer requests and pray with the group.";

  const handleJoin = async () => {
    setLoading(true);
    try {
      const data = await addUserToPrayerGroup(userId, group.id);
      if (data.success) {
        router.push(`/group/${group.id}`); // After joining, navigate to the group page
      } else {
        alert("Failed to join group. Please try again.");
      }
    } catch (error) {
      console.error("Error joining group:", error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.push("/");
  };

  const content = (
    <div className="flex flex-col gap-3">
      {group.description && (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">Description:</p>
          <div>{group.description}</div>
        </div>
      )}
      <div className="flex ">
        <div className="flex-1 flex flex-col gap-2 mb-2">
          <p className="text-sm font-semibold">Owner:</p>
          <UserAvatar
            name={group.owner.name}
            email={group.owner.email}
            image={group.owner.image ?? undefined}
            includeEmail={false}
            size="small"
          />
        </div>

        <div className="flex-1 flex flex-col gap-2 mb-2">
          <p className="text-sm font-semibold"> Group:</p>
          <p className="text-sm color-muted">{group._count.users} members</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="w-full" variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button className="w-full mb-2" onClick={handleJoin} disabled={loading}>
          {loading ? <ActiveLoader /> : "Join Group"}
        </Button>
      </div>
    </div>
  );

  return isMobile ? (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) handleClose();
      }}
    >
      <DrawerContent className="min-h-[400px]">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        {content}
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) handleClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
