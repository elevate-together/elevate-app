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
import { Plus } from "lucide-react";
import { useState } from "react";
import PrayerGroupForm from "./prayer-group-form";

type PrayerGroupCreateProps = {
  id: string;
  isMenu?: boolean;
  hideOnMobile?: boolean;
};

export default function PrayerGroupCreate({
  id,
  isMenu = false,
  hideOnMobile = false,
}: PrayerGroupCreateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  if (hideOnMobile && isMobile) return null;

  const handleCancel = () => {
    setIsOpen(false);
  };
  const handleSubmit = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={`${
            isMenu ? "flex justify-start items-center w-full p-2" : ""
          }`}
          variant={isMenu ? "ghost" : "secondary"}
        >
          <Plus /> Create New Group
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create New Prayer Group</DialogTitle>
        </DialogHeader>
        <PrayerGroupForm
          ownerId={id}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
        <DialogDescription hidden>Create New Prayer Group</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
