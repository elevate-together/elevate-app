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
import { CalendarPlus } from "lucide-react";
import { useState } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import ReminderForm from "../reminder-form";
import { User } from "@prisma/client";

type ReminderAddProps = {
  user: User;
  icon?: boolean;
  reminderTitle?: string;
  reminderText?: string;
  className?: string;
  isMenu?: boolean;
};

export default function ReminderAdd({
  user,
  icon = false,
  reminderTitle,
  reminderText,
  className = "",
  isMenu = false,
}: ReminderAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const dialogTitle = "Schedule a new reminder";
  const dialogDescription = "Customize a New Reminder";
  const buttonLabel = "Add Reminder";

  const handleCancel = () => {
    setIsOpen(false);
  };
  const handleSubmit = () => {
    setIsOpen(false);
  };

  const ButtonTrigger = icon ? (
    <Button size="icon" variant="ghost" className={className}>
      <CalendarPlus />
    </Button>
  ) : (
    <Button
      aria-label="Schedule a new reminder"
      size="sm"
      className={`${
        isMenu ? "flex justify-start items-center w-full p-2" : ""
      } ${className}`}
      variant={isMenu ? "ghost" : "secondary"}
    >
      <CalendarPlus />
      {buttonLabel}
    </Button>
  );

  const FormContent = (
    <ReminderForm
      user={user}
      reminderTitle={reminderTitle}
      reminderText={reminderText}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
    />
  );

  return isMobile ? (
    <Drawer open={isOpen && isMobile} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{ButtonTrigger}</DrawerTrigger>
      <DrawerContent fullHeight>
        <DrawerHeader className="mb-1 gap-1">
          <DrawerTitle>{dialogTitle}</DrawerTitle>
          <DrawerDescription hidden aria-hidden>
            {dialogDescription}
          </DrawerDescription>
        </DrawerHeader>
        {FormContent}
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen && !isMobile} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{ButtonTrigger}</DialogTrigger>
      <DialogContent className="max-w-sm gap-0">
        <DialogHeader className="m-0 gap-0">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription hidden aria-hidden>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        {FormContent}
      </DialogContent>
    </Dialog>
  );
}
