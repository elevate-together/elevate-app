"use client";

import { useState } from "react";
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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ArrowLeftRight } from "lucide-react";
import PrayerGroupOwnerForm from "./prayer-group-owner-form";
import { PrayerGroup } from "@prisma/client";
import { MinimalUser } from "@/lib/utils";

type PrayerGroupOwnerChangeProps = {
  prayerGroup: PrayerGroup;
  members: MinimalUser[];
};

export default function PrayerGroupOwnerChange({
  prayerGroup,
  members,
}: PrayerGroupOwnerChangeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleCancel = () => setIsOpen(false);
  const handleSubmit = () => setIsOpen(false);

  return isMobile ? (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          aria-label="Change prayer group owner"
          variant="secondary"
          size="icon"
        >
          <ArrowLeftRight />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm py-5 px-5 mb-10">
          <DrawerHeader className="text-left px-0 py-3">
            <DrawerTitle>Change Prayer Group Owner</DrawerTitle>
          </DrawerHeader>
          <PrayerGroupOwnerForm
            prayerGroup={prayerGroup}
            members={members}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
          <DrawerDescription hidden>
            Change Prayer Group Owner
          </DrawerDescription>
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button aria-label="Change prayer group owner" variant="secondary">
          <ArrowLeftRight />
          Change Owner
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Change Prayer Group Owner</DialogTitle>
        </DialogHeader>
        <PrayerGroupOwnerForm
          prayerGroup={prayerGroup}
          members={members}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
        <DialogDescription hidden>Change Prayer Group Owner</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
