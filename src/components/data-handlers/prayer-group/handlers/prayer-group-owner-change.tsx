"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { PrayerGroup } from "@prisma/client";
import { PrayerGroupOwnerForm } from "@/components/data-handlers";
import {
  ButtonHandler,
  ButtonHandlerVariant,
  DrawerDialog,
} from "@/components/common";
import { Session } from "next-auth";

type PrayerGroupOwnerChangeProps = {
  prayerGroup: PrayerGroup;
  members: Session["user"][];
  variant?: ButtonHandlerVariant;
};

export function PrayerGroupOwnerChange({
  prayerGroup,
  members,
  variant,
}: PrayerGroupOwnerChangeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCancel = () => setIsOpen(false);
  const handleSubmit = () => setIsOpen(false);

  const triggerButton = (
    <ButtonHandler
      variant={variant}
      icon={ArrowLeftRight}
      title="Change Prayer Group Owner"
      onClick={() => setIsOpen(true)}
    />
  );

  return (
    <DrawerDialog
      isOpen={isOpen}
      setIsOpen={() => setIsOpen(!isOpen)}
      content={
        <PrayerGroupOwnerForm
          prayerGroup={prayerGroup}
          members={members}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      }
      title={"Change Prayer Group Owner"}
      buttonTrigger={triggerButton}
    />
  );
}
