"use client";

import { useIsMobile } from "@/components/hooks/use-mobile";
import { PrayerRequestForm } from "@/components/data-handlers";
import { Hand } from "lucide-react";
import { useState } from "react";
import {
  ButtonHandler,
  ButtonHandlerVariant,
  DrawerDialog,
} from "@/components/common";

type PrayerRequestCreateProps = {
  userId: string;
  variant?: ButtonHandlerVariant;
  defaultGroupId?: string; // only for create
};

export function PrayerRequestCreate({
  userId,
  variant,
  defaultGroupId = "",
}: PrayerRequestCreateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleClose = () => {
    setIsOpen(false);
  };

  const buttonTrigger = (
    <ButtonHandler
      variant={variant}
      icon={Hand}
      onClick={() => setIsOpen(!open)}
      title="Add Prayer Request"
    />
  );

  return (
    <DrawerDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      content={
        <PrayerRequestForm
          userId={userId}
          onSubmit={handleClose}
          onCancel={handleClose}
          isOpen={isOpen && isMobile}
          defaultGroupId={defaultGroupId}
        />
      }
      title="Add New Prayer Request"
      description={"Let others know how they can be praying for you."}
      buttonTrigger={buttonTrigger}
    />
  );
}
