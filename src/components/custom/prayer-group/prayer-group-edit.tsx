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
import { Edit2 } from "lucide-react";
import { useState } from "react";
import PrayerGroupForm from "./prayer-group-form";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { PrayerGroup } from "@prisma/client";

type PrayerGroupEditProps = {
  id: string;
  group: PrayerGroup;
  isMenu?: boolean;
  hideOnMobile?: boolean;
};

export default function PrayerGroupEdit({
  id,
  group,
  isMenu = false,
  hideOnMobile = false,
}: PrayerGroupEditProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  if (hideOnMobile && isMobile) return null;

  const dialogTitle = "Edit Prayer Group";
  const dialogDescription = "Edit Prayer Group";
  const buttonLabel = "Edit Prayer Group";
  const buttonLabelShort = "Edit Group";
  const ariaLabel = "Create a new prayer group";

  const handleCancel = () => {
    setIsOpen(false);
  };
  const handleSubmit = () => {
    setIsOpen(false);
  };

  const prayerForm = (
    <PrayerGroupForm
      ownerId={id}
      group={group}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );

  return isMobile ? (
    <Drawer open={isOpen && isMobile} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          aria-label={ariaLabel}
          size="icon"
          variant={isMenu ? "ghost" : "secondary"}
        >
          <Edit2 /> {!isMobile && buttonLabel}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{dialogTitle}</DrawerTitle>
        </DrawerHeader>
        {prayerForm}
        <DrawerDescription hidden>{dialogDescription}</DrawerDescription>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen && !isMobile} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          aria-label={ariaLabel}
          className={`${
            isMenu ? "flex justify-start items-center w-full p-2" : ""
          }`}
          variant={isMenu ? "ghost" : "secondary"}
        >
          <Edit2 /> {buttonLabelShort}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        {prayerForm}
        <DialogDescription hidden>{dialogDescription}</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
