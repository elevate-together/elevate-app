"use client";

import { useIsMobile } from "@/components/hooks/use-mobile";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Trash } from "lucide-react";
import { useState } from "react";
import { deletePrayerRequest } from "@/services/prayer-request";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type PrayerGroupDeleteProps = {
  id: string;
  includeText?: boolean;
  className?: string;
};

export default function PrayerRequestDelete({
  id,
  includeText = false,
  className = "",
}: PrayerGroupDeleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();

  const handleDeleteRequest = async () => {
    const result = await deletePrayerRequest(id);

    if (result.success) {
      toast.success(result.message);
      setIsOpen(false);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  return isMobile ? (
    <Drawer open={isOpen && isMobile} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          size={includeText ? "default" : "icon"}
          variant="ghost"
          aria-label="Delete prayer request"
          className={className}
        >
          <Trash />
          {includeText && "Delete"}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm py-5 px-5 md:p-0">
          <DrawerHeader className="text-left p-0">
            <DrawerTitle>
              Are you sure you want to delete this prayer request?
            </DrawerTitle>
            <DrawerDescription>
              This action cannot be undone. This will permanently delete your
              prayer request.
            </DrawerDescription>
          </DrawerHeader>

          <DrawerFooter className="flex flex-row px-0">
            <DrawerClose asChild>
              <Button className="flex-1" variant="secondary">
                Cancel
              </Button>
            </DrawerClose>
            <Button
              className="flex-1"
              type="submit"
              onClick={handleDeleteRequest}
            >
              Confirm
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen && !isMobile} onOpenChange={setIsOpen}>
      <Button
        size={includeText ? "default" : "icon"}
        variant="ghost"
        aria-label="Delete prayer request"
        className={className}
      >
        <Trash />
        {includeText && "Delete"}
      </Button>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to delete this prayer request?
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-left">
          This action cannot be undone. This will permanently delete your prayer
          request.
        </DialogDescription>
        <DialogFooter className="flex flex-row">
          <DialogClose asChild>
            <Button className="flex-1" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="flex-1"
            type="submit"
            onClick={handleDeleteRequest}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
