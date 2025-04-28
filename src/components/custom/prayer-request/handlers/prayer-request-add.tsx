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

type PrayerGroupCreateProps = {
  id: string;
  isMenu?: boolean;
  hideOnMobile?: boolean;
  includeText?: boolean;
} & ButtonProps;

export default function PrayerRequestAdd({
  id,
  isMenu = false,
  hideOnMobile = false,
  includeText = false,
  ...props
}: PrayerGroupCreateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  if (hideOnMobile && isMobile) return null;

  const handleClose = () => {
    setIsOpen(false);
  };

  const buttonLabel = includeText ? "Add" : "Add Prayer Request";
  const drawerTitle = "New Prayer Request";
  const drawerDescription = "Let others know how they can be praying for you.";
  const dialogTitle = "Add New Prayer Request";
  const dialogDescription = "Let others know how they can be praying for you.";

  const renderButton = (
    <Button
      size={
        isMobile && !isMenu
          ? includeText
            ? "default"
            : "largeIcon"
          : "default"
      }
      variant={isMenu ? "ghost" : "secondary"}
      className={`${
        isMenu ? "flex justify-start items-center w-full p-2" : ""
      }`}
      {...props}
    >
      <Plus />
      {isMobile && !isMenu ? (includeText ? "Add" : "") : buttonLabel}
    </Button>
  );

  const prayerRequestForm = (
    <PrayerRequestForm
      userId={id}
      onSubmit={handleClose}
      onCancel={handleClose}
      isOpen={isOpen && isMobile}
    />
  );

  return isMobile ? (
    <Drawer open={isOpen && isMobile} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{renderButton}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{drawerTitle}</DrawerTitle>
          <DrawerDescription>{drawerDescription}</DrawerDescription>
        </DrawerHeader>
        {prayerRequestForm}
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
        {prayerRequestForm}
        <DialogDescription hidden>{dialogDescription}</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
