"use client";

import { Edit2 } from "lucide-react";
import { useState } from "react";
import { PrayerGroup } from "@prisma/client";
import { PrayerGroupForm } from "@/components/data-handlers";
import {
  ButtonHandler,
  ButtonHandlerVariant,
  DrawerDialog,
} from "@/components/common";

type PrayerGroupEditProps = {
  ownerId: string;
  group: PrayerGroup;
  variant?: ButtonHandlerVariant;
};

export function PrayerGroupEdit({
  ownerId,
  group,
  variant,
}: PrayerGroupEditProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCancel = () => {
    setIsOpen(false);
  };
  const handleSubmit = () => {
    setIsOpen(false);
  };

  const buttonTrigger = (
    <ButtonHandler
      variant={variant}
      icon={Edit2}
      title="Edit Prayer Group"
      onClick={() => setIsOpen(!open)}
    />
  );

  return (
    <DrawerDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      content={
        <PrayerGroupForm
          ownerId={ownerId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          group={group}
        />
      }
      title={"Edit Prayer Group"}
      buttonTrigger={buttonTrigger}
    />
  );
}
