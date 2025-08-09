"use client";

import { Edit } from "lucide-react";
import { useState } from "react";
import { Reminder } from "@prisma/client";
import { ReminderForm } from "@/components/data-handlers";
import {
  ButtonHandler,
  ButtonHandlerVariant,
  DrawerDialog,
} from "@/components/common";
import { Session } from "next-auth";

type ReminderEditProps = {
  user: Session["user"];
  reminder: Reminder;
  variant?: ButtonHandlerVariant;
};

export function ReminderEdit({ user, reminder, variant }: ReminderEditProps) {
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
      icon={Edit}
      title="Edit Reminder"
      onClick={() => setIsOpen(true)}
    />
  );
  return (
    <DrawerDialog
      isOpen={isOpen}
      setIsOpen={() => setIsOpen(!isOpen)}
      content={
        <ReminderForm
          user={user}
          reminder={reminder}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      }
      title="Edit Reminder"
      buttonTrigger={buttonTrigger}
    />
  );
}
