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
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Plus } from "lucide-react";
import { useState } from "react";

type PrayerGroupCreateProps = {
  id: string;
  isMenu?: boolean;
  hideOnMobile?: boolean;
};

export default function PrayerRequestCreate({
  id,
  isMenu = false,
  hideOnMobile = false,
}: PrayerGroupCreateProps) {
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);

  const isMobile = useIsMobile();

  if (hideOnMobile && isMobile) return null;

  const handleCloseDialog = () => {
    setIsOpenDialog(false);
  };

  const handleCloseDrawer = () => {
    setIsOpenDrawer(false);
  };

  return isMobile ? (
    <Drawer open={isOpenDrawer} onOpenChange={setIsOpenDrawer}>
      <DrawerTrigger asChild>
        {isMobile && !isMenu ? (
          <Button size="icon" variant={isMenu ? "ghost" : "secondary"}>
            <Plus />
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
        <div className="mx-auto w-full max-w-sm py-5 px-8">
          <DrawerHeader className="text-left p-0">
            <DrawerTitle>New Prayer Request</DrawerTitle>
            <DrawerDescription>
              Let others know how they can be praying for you.
            </DrawerDescription>
          </DrawerHeader>
          <PrayerRequestForm
            userId={id}
            onSubmit={handleCloseDrawer}
            onCancel={handleCloseDrawer}
          />
        </div>
        <DrawerFooter></DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
      <DialogTrigger asChild>
        {isMobile && !isMenu ? (
          <Button size="icon" variant={isMenu ? "ghost" : "secondary"}>
            <Plus />
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
          userId={id}
          onSubmit={handleCloseDialog}
          onCancel={handleCloseDialog}
        />
        <DialogDescription hidden>Add New Prayer Request</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
