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
import PrayerGroupForm from "./prayer-group-form";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type PrayerGroupCreateProps = {
  id: string;
  isMenu?: boolean;
  hideOnMobile?: boolean;
};

export default function PrayerGroupCreate({
  id,
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
          className={`${
            isMenu ? "flex justify-start items-center w-full p-2" : ""
          }`}
          variant={isMenu ? "ghost" : "secondary"}
        >
          <Plus />
          {isMobile ? "New Group" : "Create New Group"}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm py-5 px-5 mb-10">
          <DrawerHeader className="text-left px-0 py-3">
            <DrawerTitle>Create New Prayer Group</DrawerTitle>
          </DrawerHeader>
          <PrayerGroupForm
            ownerId={id}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
          <DrawerDescription hidden>Create New Prayer Group</DrawerDescription>
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen && !isMobile} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          aria-label="Create a new prayer group"
          className={`${
            isMenu ? "flex justify-start items-center w-full p-2" : ""
          }`}
          variant={isMenu ? "ghost" : "secondary"}
        >
          <Plus /> {isMobile ? "New Group" : "Create New Group"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create New Prayer Group</DialogTitle>
        </DialogHeader>
        <PrayerGroupForm
          ownerId={id}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
        <DialogDescription hidden>Create New Prayer Group</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
