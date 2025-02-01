"use client";

import { useIsMobile } from "@/components/hooks/use-mobile";

import PrayerRequestForm from "@/components/custom/prayer-request/prayer-request-form";
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

type PrayerGroupCreateProps = {
  id: string;
  isMenu?: boolean;
  hideOnMobile?: boolean;
};

export default function PrayerRequestCreate({
  id,
  isMenu = false,
  hideOnMobile = false,
}: PrayerGroupCreateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  if (hideOnMobile && isMobile) return null;

  const handleCloseDialog = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isMobile && !isMenu ? (
          <Button size="icon" variant={isMenu ? "ghost" : "secondary"} >
            <Plus />
          </Button>
        ) : (
          <Button
            className={`${
              isMenu ? "flex justify-start items-center w-full p-2" : ""
            }`}
            variant={isMenu ? "ghost" : "secondary"}
          >
            <Plus /> Add Prayer Request
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="max-w-sm"
        aria-describedby="Add New Prayer Request"
      >
        <DialogHeader>
          <DialogTitle>Add New Prayer Request</DialogTitle>
        </DialogHeader>
        <PrayerRequestForm
          userId={id}
          onSubmit={handleCloseDialog}
          onCancel={handleCloseDialog}
        />
        <DialogDescription hidden>Add New Prayer Request</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
