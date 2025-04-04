"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { sendNotificationAllDevices } from "@/services/device";
import {
  deletePrayerRequest,
  updatePrayerRequestStatus,
} from "@/services/prayer-request";
import { PrayerRequestStatus, User, type PrayerRequest } from "@prisma/client";
import { DialogClose, DialogDescription } from "@radix-ui/react-dialog";
import { format, isSameDay } from "date-fns";
import { Bell, Edit2Icon, Hand, Package, Star, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import PrayerRequestForm from "./prayer-request-form";

type PrayerRequestCardProps = {
  prayer: PrayerRequest;
  user: User;
  isOwner?: boolean;
  displayName?: boolean;
  currUserName?: string;
};

export default function PrayerRequestCard({
  prayer,
  user,
  isOwner = false,
  displayName = false,
  currUserName = "",
}: PrayerRequestCardProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSendNotification = async () => {
    const title =
      currUserName != ""
        ? currUserName.includes(" ")
          ? `${currUserName.split(" ")[0]} just prayed for you!`
          : `${currUserName} just prayed for you!`
        : "Someone just prayed for you!";
    const message = `${currUserName} just prayed for ${prayer.request} `;
    const result = await sendNotificationAllDevices(user.id, message, title);

    if (result.success) {
      if (result.message == "User doesn't have notifications enabled")
        toast.warning(result.message);
      else {
        toast.success(result.message);
      }
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const handleUpdateStatus = async (status: PrayerRequestStatus) => {
    const result = await updatePrayerRequestStatus(prayer.id, status);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteRequest = async () => {
    const result = await deletePrayerRequest(prayer.id);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Card className="shadow-none">
      <CardHeader className="px-5 py-4 pb-0">
        <CardTitle>
          <div className="flex flex-row justify-between items-start gap-3">
            <div className="font-normal mt-2 mb-3">{prayer.request}</div>
            {!isOwner && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSendNotification}
              >
                <Bell />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col ">
            <div
              className={`${
                prayer.status === PrayerRequestStatus.ANSWERED
                  ? "font-normal text-xs"
                  : "font-semibold text-sm"
              }`}
            >
              {prayer.status === PrayerRequestStatus.ANSWERED
                ? `Created: ${format(new Date(prayer.createdAt), "MM/dd/yy")}`
                : format(new Date(prayer.createdAt), "MMMM d, yyyy")}
            </div>
            {prayer.status === PrayerRequestStatus.ANSWERED ? (
              <div className="text-xs font-semibold">
                Answered: {format(new Date(prayer.updatedAt), "MM/dd/yy")}
              </div>
            ) : (
              !isSameDay(
                new Date(prayer.createdAt),
                new Date(prayer.updatedAt)
              ) && (
                <div className="text-xs">
                  Last Updated: {format(new Date(prayer.updatedAt), "MM/dd/yy")}
                </div>
              )
            )}
          </div>
          {displayName && <div className="font-bold text-sm">{user.name}</div>}

          {isOwner ? (
            <div className="flex flex-row gap-0">
              {prayer.status == PrayerRequestStatus.IN_PROGRESS && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <Edit2Icon />
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Prayer Request</DialogTitle>
                    </DialogHeader>
                    <PrayerRequestForm
                      prayer={prayer}
                      userId={user.id}
                      isOpen={open}
                      onSubmit={() => setOpen(false)}
                      onCancel={() => setOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              )}

              {prayer.status != PrayerRequestStatus.ANSWERED && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <Trash />
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        Are you sure you want to delete this prayer request?
                      </DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete
                      your prayer request.
                    </DialogDescription>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" onClick={handleDeleteRequest}>
                        Confirm
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {prayer.status != PrayerRequestStatus.ARCHIVED && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          handleUpdateStatus(PrayerRequestStatus.ARCHIVED)
                        }
                      >
                        <Package />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Archive</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {prayer.status != PrayerRequestStatus.IN_PROGRESS && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          handleUpdateStatus(PrayerRequestStatus.IN_PROGRESS)
                        }
                      >
                        <Hand />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Request</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {prayer.status != PrayerRequestStatus.ANSWERED && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          handleUpdateStatus(PrayerRequestStatus.ANSWERED)
                        }
                      >
                        <Star />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mark as Answered</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
