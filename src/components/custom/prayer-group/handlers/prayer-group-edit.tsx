"use client";

import { useIsMobile } from "@/components/hooks/use-mobile";
import { Button, ButtonProps } from "@/components/ui/button";
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
import PrayerGroupForm from "@/components/custom/prayer-group/handlers/prayer-group-form";
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
  ownerId: string;
  group: PrayerGroup;
  isMenu?: boolean;
  hideOnMobile?: boolean;
} & ButtonProps;

export default function PrayerGroupEdit({
  ownerId,
  group,
  isMenu = false,
  hideOnMobile = false,
  ...props
}: PrayerGroupEditProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  if (hideOnMobile && isMobile) return null;

  const dialogTitle = "Edit Prayer Group";
  const dialogDescription = "Edit Prayer Group";

  const handleCancel = () => {
    setIsOpen(false);
  };
  const handleSubmit = () => {
    setIsOpen(false);
  };

  const prayerForm = (
    <PrayerGroupForm
      ownerId={ownerId}
      group={group}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );

  const buttonTrigger = (
    <Button
      aria-label={dialogDescription}
      size="icon"
      variant={isMenu ? "ghost" : "secondary"}
      {...props}
    >
      <Edit2 />
    </Button>
  );

  return isMobile ? (
    <Drawer open={isOpen && isMobile} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{buttonTrigger}</DrawerTrigger>
      <DrawerContent fullHeight>
        <DrawerHeader>
          <DrawerTitle>{dialogTitle}</DrawerTitle>
        </DrawerHeader>
        {prayerForm}
        <DrawerDescription hidden>{dialogDescription}</DrawerDescription>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen && !isMobile} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{buttonTrigger}</DialogTrigger>
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
