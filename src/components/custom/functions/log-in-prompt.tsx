"use client";

import { useIsMobile } from "@/components/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserRoundPlus } from "lucide-react";
import SignIn from "../user/user-sign-in";
import { Separator } from "@/components/ui/separator";

interface LogInPromptProps {
  callback: string;
}

export default function LogInPrompt({ callback }: LogInPromptProps) {
  const [isOpen, setIsOpen] = useState(true);
  const isMobile = useIsMobile();
  const router = useRouter();

  const title = "Looks like you're not logged in!";
  const description = "You must log in or create an annount before continuing.";

  const handleClose = () => {
    router.push("/");
  };

  const content = (
    <div className="flex flex-col gap-3 max-w-[500px]">
      <div>
        <h2 className="text-md font-semibold">Get Started with Elevate</h2>
        <p className="text-muted-foreground text-sm">
          Connect your google account to get started today
        </p>
      </div>
      <SignIn callback={callback}>
        <UserRoundPlus />
        Sign Up
      </SignIn>
      <Separator className="my-3" />
      <p className="text-muted-foreground text-sm">Already Have an account?</p>
      <SignIn variant="secondary" callback={callback}>
        Log In
      </SignIn>
    </div>
  );

  return isMobile ? (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) handleClose();
      }}
    >
      <DrawerContent className="min-h-[400px]">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        {content}
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) handleClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
