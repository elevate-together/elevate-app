"use client";

import { Input } from "@/components/ui";
import { Share } from "lucide-react";
import { useState } from "react";

import {
  QrCode,
  CopyButton,
  DrawerDialog,
  ButtonHandler,
  ButtonHandlerVariant,
} from "@/components/common";
import { PrayerGroupWithOwner } from "@/lib/utils";

type PrayerGroupJoinLinkProps = {
  prayerGroup: PrayerGroupWithOwner;
  variant: ButtonHandlerVariant;
};

export function PrayerGroupJoinLink({
  prayerGroup,
  variant,
}: PrayerGroupJoinLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/group/join/${prayerGroup.id}`;
  const content = (
    <div className="flex flex-col gap-4 items-center">
      <QrCode route={`/group/join/${prayerGroup.id}`} />

      <div className="flex w-full items-center gap-2">
        <Input value={joinUrl} readOnly className="w-full" />
        <CopyButton text={joinUrl} />
      </div>
    </div>
  );

  const buttonTrigger = (
    <ButtonHandler
      variant={variant}
      icon={Share}
      title={"Share Group"}
      onClick={() => setIsOpen(true)}
    />
  );

  return (
    <DrawerDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      content={content}
      title={`Invite Friends to Join ${prayerGroup.name}`}
      description={`Share the QR code or copy the link below to invite your friends to join ${prayerGroup.name}`}
      buttonTrigger={buttonTrigger}
    />
  );
}
