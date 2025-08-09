"use client";

import { useIsMobile } from "@/components/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui";

type DrawerDialogProps = {
  isOpen: boolean;
  setIsOpen: (e: boolean) => void;
  content: React.ReactNode;
  title: string;
  buttonTrigger: React.ReactNode;
  description?: string;
};

export function DrawerDialog({
  isOpen,
  setIsOpen,
  content,
  title,
  description,
  buttonTrigger,
}: DrawerDialogProps) {
  const isMobile = useIsMobile();

  return isMobile ? (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{buttonTrigger}</DrawerTrigger>
      <DrawerContent fullHeight>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        {content}
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{buttonTrigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
