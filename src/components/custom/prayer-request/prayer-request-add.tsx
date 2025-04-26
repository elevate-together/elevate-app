"use client";

import { useIsMobile } from "@/components/hooks/use-mobile";

import PrayerRequestForm from "@/components/custom/prayer-request/prayer-request-form";
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

  return isMobile ? (
    <Drawer open={isOpen && isMobile} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        {isMobile && !isMenu ? (
          <Button
            size={includeText ? "default" : "largeIcon"}
            variant={isMenu ? "ghost" : "secondary"}
            {...props}
          >
            <Plus />
            {includeText && "Add"}
          </Button>
        ) : (
          <Button
            className={`${
              isMenu ? "flex justify-start items-center w-full p-2" : ""
            }`}
            variant={isMenu ? "ghost" : "secondary"}
          >
            <Plus /> Add Prayer Request
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm py-5 px-5 mb-10 md:p-0">
          <DrawerHeader className="text-left p-0">
            <DrawerTitle>New Prayer Request</DrawerTitle>
            <DrawerDescription>
              Let others know how they can be praying for you.
            </DrawerDescription>
          </DrawerHeader>
          <PrayerRequestForm
            userId={id}
            onSubmit={handleClose}
            onCancel={handleClose}
            isOpen={isOpen && isMobile}
          />
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen && !isMobile} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isMobile && !isMenu ? (
          <Button
            size={includeText ? "default" : "largeIcon"}
            variant={isMenu ? "ghost" : "secondary"}
            {...props}
          >
            <Plus />
            {includeText && "Add"}
          </Button>
        ) : (
          <Button
            className={`${
              isMenu ? "flex justify-start items-center w-full p-2" : ""
            }`}
            variant={isMenu ? "ghost" : "secondary"}
          >
            <Plus /> Add Prayer Request
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="max-w-sm"
        aria-describedby="Add New Prayer Request"
      >
        <DialogHeader>
          <DialogTitle>Add New Prayer Request</DialogTitle>
          <DialogDescription>
            Let others know how they can be praying for you.
          </DialogDescription>
        </DialogHeader>
        <PrayerRequestForm
          isOpen={isOpen && !isMobile}
          userId={id}
          onSubmit={handleClose}
          onCancel={handleClose}
        />
        <DialogDescription hidden>Add New Prayer Request</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
