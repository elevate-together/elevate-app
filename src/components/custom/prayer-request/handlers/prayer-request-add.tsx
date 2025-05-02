"use client";

import { useIsMobile } from "@/components/hooks/use-mobile";
import PrayerRequestForm from "@/components/custom/prayer-request/handlers/prayer-request-form";
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
import { Plus } from "lucide-react";
import { useState } from "react";
import { ButtonProps } from "@/components/ui/button";

type PrayerRequestAddProps = {
  userId: string;
  isMenu?: boolean;
  defaultGroupId?: string; // only for create
} & ButtonProps;

export default function PrayerRequestAdd({
  userId,
  isMenu = false,
  defaultGroupId = "",
  ...props
}: PrayerRequestAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleClose = () => {
    setIsOpen(false);
  };

  const buttonLabel = "Add Prayer Request";
  const drawerTitle = "New Prayer Request";
  const drawerDescription = "Let others know how they can be praying for you.";
  const dialogTitle = "Add New Prayer Request";
  const dialogDescription = "Let others know how they can be praying for you.";

  const renderButton = (
    <Button
      size={isMenu ? "default" : "icon"}
      variant={isMenu ? "ghost" : "secondary"}
      className={`${
        isMenu ? "flex justify-start items-center w-full p-2" : ""
      }`}
      {...props}
    >
      <Plus />
      {isMenu && buttonLabel}
    </Button>
  );

  return isMobile ? (
    <Drawer open={isOpen && isMobile} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{renderButton}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{drawerTitle}</DrawerTitle>
          <DrawerDescription>{drawerDescription}</DrawerDescription>
        </DrawerHeader>
        <PrayerRequestForm
          userId={userId}
          onSubmit={handleClose}
          onCancel={handleClose}
          isOpen={isOpen && isMobile}
          defaultGroupId={defaultGroupId}
        />
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen && !isMobile} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{renderButton}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <PrayerRequestForm
          userId={userId}
          onSubmit={handleClose}
          onCancel={handleClose}
          isOpen={isOpen && !isMobile}
          defaultGroupId={defaultGroupId}
        />
        <DialogDescription hidden>{dialogDescription}</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
