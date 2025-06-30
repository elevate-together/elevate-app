"use client";

import { useIsMobile } from "@/components/hooks/use-mobile";

import PrayerRequestForm from "@/components/custom/prayer-request/handlers/prayer-request-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Edit2Icon } from "lucide-react";
import { useState } from "react";

import { PrayerRequest } from "@prisma/client";

type PrayerRequestEditProps = {
  prayer: PrayerRequest;
  userId: string;
  includeText?: boolean;
  className?: string;
};

export default function
 PrayerRequestEdit({
  prayer,
  userId,
  includeText = false,
  className = "",
}: PrayerRequestEditProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const title = "Edit Prayer Request";

  const triggerButton = (
    <Button
      size={includeText ? "default" : "icon"}
      variant="ghost"
      aria-label="Edit prayer request"
      className={className}
    >
      <Edit2Icon />
      {includeText && "Edit"}
    </Button>
  );

  const prayerRequestFrom = (
    <PrayerRequestForm
      userId={userId}
      prayer={prayer}
      isOpen={isOpen && isMobile}
      onSubmit={() => setIsOpen(false)}
      onCancel={() => setIsOpen(false)}
    />
  );

  return isMobile ? (
    <Drawer open={isOpen && isMobile} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent fullHeight>
        <DrawerHeader>
          <DrawerTitle className="mb-2">{title}</DrawerTitle>
        </DrawerHeader>
        {prayerRequestFrom}
        <DrawerFooter></DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen && !isMobile} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {prayerRequestFrom}
      </DialogContent>
    </Dialog>
  );
}
