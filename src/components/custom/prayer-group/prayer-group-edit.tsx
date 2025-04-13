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

type PrayerGroupCreateProps = {
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
}: PrayerGroupCreateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  if (hideOnMobile && isMobile) return null;

  const handleCancel = () => {
    setIsOpen(false);
  };
  const handleSubmit = () => {
    setIsOpen(false);
  };

  return isMobile ? (
    <Drawer open={isOpen && isMobile} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          aria-label="Create a new prayer group"
          size={isMobile ? "icon" : "default"}
          className={`${
            isMenu ? "flex justify-start items-center w-full p-2" : ""
          }`}
          variant={isMenu ? "ghost" : "secondary"}
        >
          <Edit2 /> {!isMobile && "Edit Prayer Group"}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm py-5 px-5 mb-6">
          <DrawerHeader className="text-left px-0 py-3">
            <DrawerTitle>Edit Prayer Group</DrawerTitle>
          </DrawerHeader>
          <PrayerGroupForm
            ownerId={id}
            group={group}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
          <DrawerDescription hidden>Edit Prayer Group</DrawerDescription>
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen && !isMobile} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          aria-label="Edit prayer group"
          className={`${
            isMenu ? "flex justify-start items-center w-full p-2" : ""
          }`}
          variant={isMenu ? "ghost" : "secondary"}
        >
          <Edit2 /> Edit Group
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Prayer Group</DialogTitle>
        </DialogHeader>
        <PrayerGroupForm
          ownerId={id}
          group={group}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
        <DialogDescription hidden>Edit Prayer Group</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
