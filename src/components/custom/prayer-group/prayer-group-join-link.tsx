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
import { Share } from "lucide-react";
import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import QrCode from "../functions/qr-code";
import { PrayerGroupWithOwner } from "@/lib/utils";
import { Input } from "@/components/ui/input"; // assuming you have an Input component
import { CopyButton } from "../functions/copy-button";

type PrayerGroupJoinLinkProps = {
  prayerGroup: PrayerGroupWithOwner;
};

export default function PrayerGroupJoinLink({
  prayerGroup,
}: PrayerGroupJoinLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/group/join/${prayerGroup.id}`;

  const title = `Invite Friends to Join ${prayerGroup.name}`;
  const description = `Share the QR code or copy the link below to invite your friends to join ${prayerGroup.name}`;

  const content = (
    <div className="flex flex-col gap-4 items-center">
      <QrCode route={`/group/join/${prayerGroup.id}`} />

      <div className="flex w-full items-center gap-2">
        <Input value={joinUrl} readOnly className="w-full" />
        <CopyButton text={joinUrl} />
      </div>
    </div>
  );

  const triggerButton = (
    <Button
      aria-label="Invite friends to your prayer group"
      size="icon"
      variant="ghost"
    >
      <Share />
    </Button>
  );

  return isMobile ? (
    <Drawer open={isOpen && isMobile} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        {content}
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen && !isMobile} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
