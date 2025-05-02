"use client";

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
import { Plus } from "lucide-react";
import { useState } from "react";
import PrayerGroupForm from "@/components/custom/prayer-group/handlers/prayer-group-form";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type PrayerGroupCreateProps = {
  groupId: string;
  isMenu?: boolean;
  hideOnMobile?: boolean;
};

export default function PrayerGroupCreate({
  groupId,
  isMenu = false,
  hideOnMobile = false,
}: PrayerGroupCreateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const dialogTitle = "Create New Prayer Group";
  const dialogDescription = "Create New Prayer Group";
  const buttonLabel = "Create New Group";
  const buttonLabelShort = "Create Group";

  if (hideOnMobile && isMobile) return null;

  const handleCancel = () => {
    setIsOpen(false);
  };
  const handleSubmit = () => {
    setIsOpen(false);
  };

  const ButtonTrigger = (
    <Button
      aria-label="Create a new prayer group"
      className={`${
        isMenu ? "flex justify-start items-center w-full p-2" : ""
      }`}
      variant={isMenu ? "ghost" : "secondary"}
    >
      <Plus />
      {isMobile ? buttonLabelShort : buttonLabel}
    </Button>
  );

  return isMobile ? (
    <Drawer open={isOpen && isMobile} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{ButtonTrigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{dialogTitle}</DrawerTitle>
        </DrawerHeader>
        <PrayerGroupForm
          ownerId={groupId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
        <DrawerDescription hidden>{dialogDescription}</DrawerDescription>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen && !isMobile} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{ButtonTrigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <PrayerGroupForm
          ownerId={groupId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
        <DialogDescription hidden>{dialogDescription}</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
