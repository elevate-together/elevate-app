"use client";
import { Users } from "lucide-react";
import { useState } from "react";
import { PrayerGroupForm } from "@/components/data-handlers";
import {
  ButtonHandler,
  ButtonHandlerVariant,
  DrawerDialog,
} from "@/components/common";

type PrayerGroupCreateProps = {
  userId: string;
  variant?: ButtonHandlerVariant;
};

export function PrayerGroupCreate({ userId, variant }: PrayerGroupCreateProps) {
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
      icon={Users}
      title="Create Prayer Group"
      onClick={() => setIsOpen(!open)}
    />
  );

  return (
    <DrawerDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      content={
        <PrayerGroupForm
          ownerId={userId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      }
      title={""}
      buttonTrigger={buttonTrigger}
      description={""}
    />
  );
}
