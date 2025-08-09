"use client";

import { useIsMobile } from "@/components/hooks/use-mobile";
import { PrayerRequestForm } from "@/components/data-handlers";
import { useState } from "react";
import { PrayerRequest } from "@prisma/client";
import {
  ButtonHandler,
  ButtonHandlerVariant,
  DrawerDialog,
} from "@/components/common";
import { Edit2 } from "lucide-react";

type PrayerRequestEditProps = {
  prayer: PrayerRequest;
  userId: string;
  variant?: ButtonHandlerVariant;
};

export function PrayerRequestEdit({
  prayer,
  userId,
  variant,
}: PrayerRequestEditProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleClose = () => {
    setIsOpen(false);
  };

  const buttonTrigger = (
    <ButtonHandler
      variant={variant}
      icon={Edit2}
      onClick={() => setIsOpen(!open)}
      title="Add Prayer Request"
    />
  );

  return (
    <DrawerDialog
      content={
        <PrayerRequestForm
          prayer={prayer}
          userId={userId}
          onSubmit={handleClose}
          onCancel={handleClose}
          isOpen={isOpen && isMobile}
        />
      }
      title="Edit Prayer Request"
      description={"Update the status or progress of your prayer request"}
      buttonTrigger={buttonTrigger}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    />
  );
}
