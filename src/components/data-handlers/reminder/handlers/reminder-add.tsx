"use client";

import { CalendarPlus } from "lucide-react";
import { useState } from "react";
import { ReminderForm } from "@/components/data-handlers";
import {
  ButtonHandler,
  ButtonHandlerVariant,
  DrawerDialog,
} from "@/components/common";
import { Session } from "next-auth";

type ReminderAddProps = {
  user: Session["user"];
  reminderTitle?: string;
  reminderText?: string;
  variant?: ButtonHandlerVariant;
};

export function ReminderAdd({
  user,
  reminderTitle,
  reminderText,
  variant,
}: ReminderAddProps) {
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
      icon={CalendarPlus}
      title="Add Reminder"
      onClick={() => setIsOpen(!isOpen)}
    />
  );

  return (
    <DrawerDialog
      isOpen={isOpen}
      setIsOpen={() => setIsOpen(!isOpen)}
      content={
        <ReminderForm
          user={user}
          reminderTitle={reminderTitle}
          reminderText={reminderText}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      }
      title="Schedule a new reminder"
      buttonTrigger={buttonTrigger}
    />
  );
}
