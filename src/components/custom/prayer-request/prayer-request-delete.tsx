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
  DialogTrigger,
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
import { Loader, Trash } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();

  const handleDeleteRequest = async () => {
    setLoading(true);
    const result = await deletePrayerRequest(id);
    if (result.success) {
      toast.success(result.message);
      setIsOpen(false);
      setTimeout(() => {
        router.refresh();
      }, 100);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
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
          <DrawerHeader className="text-left p-0 gap-4">
            <DrawerTitle>
              Are you sure you want to delete this prayer request?
            </DrawerTitle>
            <DrawerDescription>
              This action cannot be undone. This will permanently delete your
              prayer request.
            </DrawerDescription>
          </DrawerHeader>

          <DrawerFooter className="flex flex-row px-0 mb-7">
            <DrawerClose asChild>
              <Button className="flex-1" variant="secondary" disabled={loading}>
                Cancel
              </Button>
            </DrawerClose>
            <Button
              className="flex-1"
              type="submit"
              onClick={handleDeleteRequest}
              disabled={loading}
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm"
              )}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen && !isMobile} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size={includeText ? "default" : "icon"}
          variant="ghost"
          aria-label="Delete prayer request"
          className={className}
        >
          <Trash />
          {includeText && "Delete"}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-sm">
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
            <Button className="flex-1" variant="secondary" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="flex-1"
            type="submit"
            onClick={handleDeleteRequest}
            disabled={loading}
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
