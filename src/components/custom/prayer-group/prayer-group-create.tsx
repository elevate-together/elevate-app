"use client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import PrayerForm from "./prayer-group-form";

export default function PrayerGroupCreate({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCloseDialog = () => {
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="secondary" onClick={() => setIsOpen(true)}>
          <Plus /> Create Group
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Prayer Group</AlertDialogTitle>
        </AlertDialogHeader>
        <PrayerForm
          ownerId={id}
          onSubmit={handleCloseDialog}
          onCancel={() => setIsOpen(false)}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}
