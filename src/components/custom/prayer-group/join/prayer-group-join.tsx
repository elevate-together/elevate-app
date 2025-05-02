"use client";

import { useIsMobile } from "@/components/hooks/use-mobile";
import { Button } from "@/components/ui/button";
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
import { PrayerGroupWithOwnerAndCount } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addUserToPrayerGroup } from "@/services/user-prayer-group";
import ActiveLoader from "@/components/custom/helpers/loaders/active-loader";
import { GroupType } from "@prisma/client";
import UserAvatar from "@/components/custom/user/user-avatar";
import { Home } from "lucide-react";

type PrayerGroupJoinProps = {
  userId: string;
  group: PrayerGroupWithOwnerAndCount;
};

export default function PrayerGroupJoin({
  userId,
  group,
}: PrayerGroupJoinProps) {
  const [isOpen, setIsOpen] = useState(true);
  const isMobile = useIsMobile();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isPrivate = group.groupType === GroupType.PRIVATE;

  const [stepIndex, setStepIndex] = useState(0);
  const steps = ["join", "accepted", "pwa", "done"];

  const nextStep = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setCanInstall(true);
    };

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setCanInstall(false);
    } else {
      window.addEventListener("beforeinstallprompt", handler);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleJoin = async () => {
    setLoading(true);
    try {
      const data = await addUserToPrayerGroup(userId, group.id);
      if (data.success) {
        nextStep();
      } else {
        alert("Failed to join group. Please try again.");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.push("/");
  };

  const renderStepContent = () => {
    switch (steps[stepIndex]) {
      case "join":
        return (
          <div className="flex flex-col gap-3">
            <div className="flex">
              <div className="flex-1 flex flex-col gap-2 mb-2">
                <p className="text-sm font-semibold">Owner:</p>
                <UserAvatar
                  user={group.owner}
                  includeEmail={false}
                  size="small"
                />
              </div>
              <div className="flex-1 flex flex-col gap-2 mb-2">
                <p className="text-sm font-semibold">Group:</p>
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
                className="w-full mb-2"
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
            <div className="flex gap-2 justify-end items-center">
              <Button variant="outline" onClick={nextStep}>
                Skip
              </Button>
              {canInstall ? (
                <Button onClick={() => installPrompt.prompt()}>
                  Add to Home Screen
                </Button>
              ) : (
                <p className="text-sm text-primary">
                  {isMobile
                    ? "If prompted, tap 'Add to Home Screen' in your browser menu."
                    : "Install is only available on supported mobile devices."}
                </p>
              )}
            </div>
          </div>
        );
      case "done":
        return (
          <div className="flex justify-end">
            <Button onClick={() => router.push(`/group/${group.id}`)}>
              <Home /> Go To Group Home
            </Button>
          </div>
        );
    }
  };

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

  const Title =
    stepIndex === 0
      ? isPrivate
        ? `Confirm Request to Join ${group.name}`
        : `Confirm Join ${group.name}`
      : stepIndex === 1
      ? group.groupType === GroupType.PRIVATE
        ? "Request Sent"
        : `You’ve Joined ${group.name}`
      : stepIndex === 2
      ? "Add Elevate to Your Home Screen"
      : "All Set!";

  const Description =
    stepIndex === 0
      ? isPrivate
        ? "This is a private group. You must be approved by the group owner before you can join and view its content."
        : "By joining, you can share prayer requests and pray with the group."
      : stepIndex === 1
      ? group.groupType === GroupType.PRIVATE
        ? "This is a private group so you're not part of this group quite yet. Once the group owner approves your request, you'll be able to view the group's information."
        : "You are now part of the group! You can now share private prayer requests and pray for others in this group!."
      : stepIndex === 2
      ? "For the best experience, install Elevate on your device to enable notifications and easily connect with others."
      : "You’re all set! You can now participate in the group and receive notifications.";

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    isMobile ? (
      <Drawer
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) handleClose();
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{Title}</DrawerTitle>
            <DrawerDescription>{Description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">{children}</div>
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
            <DialogTitle>{Title}</DialogTitle>
            <DialogDescription>{Description}</DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );

  return (
    <Wrapper>
      <div className="transition-all duration-300 ease-in-out">
        {renderStepContent()}
        <StepDots />
      </div>
    </Wrapper>
  );
}
