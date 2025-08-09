"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/components/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  Button,
} from "@/components/ui";
import {} from "@/components/ui/drawer";
import { PartyPopper, Home, Share } from "lucide-react";
import { GroupType } from "@prisma/client";
import { ActiveLoader } from "@/components/common";
import { UserAvatar } from "@/components/data-handlers";
import { addUserToPrayerGroup } from "@/services/user-prayer-group";
import { PrayerGroupWithOwnerAndCount } from "@/lib/utils";
import { toast } from "sonner";

type PrayerGroupJoinProps = {
  userId: string;
  group: PrayerGroupWithOwnerAndCount;
};

export function PrayerGroupJoin({ userId, group }: PrayerGroupJoinProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const router = useRouter();
  const isMobile = useIsMobile();
  const isPrivate = group.groupType === GroupType.PRIVATE;

  const steps = ["join", "accepted", "pwa", "done"];
  const nextStep = useCallback(
    () => setStepIndex((i) => Math.min(i + 1, steps.length - 1)),
    [steps.length]
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setCanInstall(true);
    };

    if (!window.matchMedia("(display-mode: standalone)").matches) {
      window.addEventListener("beforeinstallprompt", handler);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleJoin = useCallback(async () => {
    setLoading(true);
    try {
      const data = await addUserToPrayerGroup(userId, group.id);
      if (data.success) {
        nextStep();
      } else {
        toast.error("Unable to join the group. Please try again later.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while joining the group.");
    } finally {
      setLoading(false);
    }
  }, [userId, group.id, nextStep]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    router.push("/");
  }, [router]);

  const StepDots = () => (
    <div className="flex justify-center gap-2 mt-4">
      {steps.map((_, idx) => (
        <div
          key={idx}
          className={`h-2 w-2 rounded-full transition-colors duration-200 ${
            idx === stepIndex ? "bg-primary" : "bg-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    isMobile ? (
      <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">{children}</div>
        </DrawerContent>
      </Drawer>
    ) : (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );

  const title =
    stepIndex === 0
      ? isPrivate
        ? `Confirm Request to Join ${group.name}`
        : `Confirm Join ${group.name}`
      : stepIndex === 1
      ? isPrivate
        ? "Request Sent"
        : `You’ve Joined ${group.name}`
      : stepIndex === 2
      ? "Add Elevate to Your Home Screen"
      : null;

  const description =
    stepIndex === 0
      ? isPrivate
        ? "This is a private group. You must be approved by the group owner before you can join and view its content."
        : "By joining, you can share prayer requests and pray with the group."
      : stepIndex === 1
      ? isPrivate
        ? "You're not part of this group just yet. Once the group owner approves your request, you’ll be notified."
        : "You’ve joined the group! Start sharing and praying with others."
      : stepIndex === 2
      ? "For the best experience, install Elevate to receive updates and stay connected."
      : null;

  const renderStepContent = () => {
    switch (steps[stepIndex]) {
      case "join":
        return (
          <div className="flex flex-col gap-3">
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1">Owner:</p>
                <UserAvatar
                  user={group.owner}
                  includeEmail={false}
                  size="small"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1">Group:</p>
                <p className="text-sm text-primary">
                  {group._count.users} members
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="w-full"
                variant="secondary"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="w-full"
                onClick={handleJoin}
                disabled={loading}
              >
                {loading ? <ActiveLoader /> : "Join Group"}
              </Button>
            </div>
          </div>
        );
      case "accepted":
        return (
          <div className="flex justify-end">
            <Button className="min-w-[75px]" onClick={nextStep}>
              Next
            </Button>
          </div>
        );
      case "pwa":
        return (
          <div className="flex flex-col gap-4 text-center">
            {!canInstall && (
              <div className="text-left space-y-2">
                <ol className="list-decimal pl-5 space-y-1">
                  <li>
                    <div className="flex flex-wrap items-center gap-1">
                      Tap the <span className="font-semibold">Share</span>
                      <Share className="h-5 w-5 inline" /> icon in Safari.
                    </div>
                  </li>
                  <li>
                    Scroll down and tap
                    <span className="font-semibold">Add to Home Screen</span>.
                  </li>
                  <li>
                    Tap <span className="font-semibold">Add</span> in the
                    top-right.
                  </li>
                </ol>
                <p className="text-sm text-muted-foreground">
                  Don’t see that option? Try using Safari or Chrome on your
                  device.
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={nextStep}>
                {canInstall ? "Skip" : "Next"}
              </Button>
              {canInstall && (
                <Button
                  onClick={() => {
                    installPrompt.prompt();
                    nextStep();
                  }}
                >
                  Add to Home Screen
                </Button>
              )}
            </div>
          </div>
        );
      case "done":
        return (
          <div className="flex flex-col items-center justify-center text-center text-primary space-y-4">
            <PartyPopper className="w-12 h-12" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">
                {isPrivate ? "Request Submitted" : "You're All Set!"}
              </p>
              <p className="text-sm">
                {isPrivate
                  ? "Your request has been sent. You'll be notified once it's approved."
                  : "You’ve joined the group! Start sharing and praying with others now."}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                router.push(isPrivate ? "/" : `/group/${group.id}`)
              }
            >
              <Home className="mr-2 h-4 w-4" />
              {isPrivate ? "Return Home" : "Go To Group Home"}
            </Button>
          </div>
        );
    }
  };

  return (
    <Wrapper>
      <div className="transition-all duration-300 ease-in-out">
        {renderStepContent()}
        <StepDots />
      </div>
    </Wrapper>
  );
}
