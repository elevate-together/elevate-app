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
import PrayerGroupOwnerForm from "@/components/custom/prayer-group/prayer-group-owner-form";
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

  const title = "Change Prayer Group Owner";

  const triggerButton = (
    <Button
      aria-label="{title}"
      variant="secondary"
      size={isMobile ? "icon" : "default"}
    >
      <ArrowLeftRight />
    </Button>
  );

  const prayerGroupForm = (
    <PrayerGroupOwnerForm
      prayerGroup={prayerGroup}
      members={members}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
    />
  );

  return isMobile ? (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        {prayerGroupForm}
        <DrawerDescription hidden>{title}</DrawerDescription>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {prayerGroupForm}
        <DialogDescription hidden>{title}</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
