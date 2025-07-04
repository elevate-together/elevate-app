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
import { Edit } from "lucide-react";
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
import { Reminder, User } from "@prisma/client";

type ReminderEditProps = {
  user: User;
  reminder: Reminder;
  icon?: boolean;
  className?: string;
  isMenu?: boolean;
};

export default function ReminderEdit({
  user,
  reminder,
  icon = false,
  className = "",
  isMenu = false,
}: ReminderEditProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const dialogTitle = "Edit Reminder";
  const dialogDescription = "Update your reminder info";
  const buttonLabel = "Edit Reminder";

  const handleCancel = () => {
    setIsOpen(false);
  };
  const handleSubmit = () => {
    setIsOpen(false);
  };

  const ButtonTrigger = icon ? (
    <Button size="icon" variant="ghost" className={className}>
      <Edit />
    </Button>
  ) : (
    <Button
      aria-label="Edit reminder"
      size="sm"
      className={`${
        isMenu ? "flex justify-start items-center w-full p-2" : ""
      } ${className}`}
      variant={isMenu ? "ghost" : "secondary"}
    >
      <Edit />
      {buttonLabel}
    </Button>
  );

  const FormContent = (
    <ReminderForm
      user={user}
      reminder={reminder}
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
