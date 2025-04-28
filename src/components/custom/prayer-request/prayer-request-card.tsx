"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { sendNotificationAllDevices } from "@/services/device";
import { updatePrayerRequestStatus } from "@/services/prayer-request";
import {
  NotificationType,
  PrayerRequestStatus,
  User,
  type PrayerRequest,
} from "@prisma/client";
import { format, isSameSecond } from "date-fns";
import {
  Bell,
  Hand,
  HandHelpingIcon,
  Package,
  Star,
  EllipsisVertical,
  Loader,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import UserAvatar from "../user/user-avatar";
import PrayerRequestDelete from "./prayer-request-delete";
import PrayerRequestEdit from "./prayer-request-edit";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

type PrayerRequestCardProps = {
  prayer: PrayerRequest;
  user: User;
  isOwner?: boolean;
  currUserName?: string;
  hideActions?: boolean;
};

export default function PrayerRequestCard({
  prayer,
  user,
  isOwner = false,
  currUserName = "",
  hideActions = false,
}: PrayerRequestCardProps) {
  const router = useRouter();
  const [isOpen, setIsPopoverOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);

  const handleSendNotification = async () => {
    setNotificationLoading(true);
    const title =
      currUserName != ""
        ? currUserName.includes(" ")
          ? `${currUserName.split(" ")[0]} prayed for you!`
          : `${currUserName} prayed for you!`
        : "Someone prayed for you!";
    const message = `${currUserName} prayed for ${prayer.request} `;
    const result = await sendNotificationAllDevices(
      user.id,
      message,
      NotificationType.PRAYER,
      title
    );

    if (result.success) {
      router.refresh();
      setNotificationSuccess(true);
      setTimeout(() => {
        setNotificationSuccess(false);
      }, 3000);
    } else {
      toast.error(result.message);
    }
    setNotificationLoading(false);
  };

  const handleUpdateStatus = async (status: PrayerRequestStatus) => {
    const result = await updatePrayerRequestStatus(prayer.id, status);

    if (result.success) {
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Card className="rounded-none mb-1 shadow border-none">
      <CardHeader className="pb-3">
        <CardTitle>
          <div className="flex justify-between items-start">
            <UserAvatar
              name={user.name}
              email={user.email}
              image={user.image || undefined}
              size="medium"
              secondLine={
                <span className="flex items-center gap-1">
                  <HandHelpingIcon className="w-4 h-4" />
                  {format(new Date(prayer.createdAt), "PPP")}
                </span>
              }
              boldName
            />
            <div className="flex flex-row justify-between items-start gap-3">
              {!isOwner ? (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSendNotification}
                >
                  {notificationLoading ? (
                    <Loader className="animate-spin" />
                  ) : notificationSuccess ? (
                    <Check />
                  ) : (
                    <Bell />
                  )}
                </Button>
              ) : (
                <div>
                  {!hideActions &&
                    prayer.status === PrayerRequestStatus.IN_PROGRESS && (
                      <PrayerRequestEdit prayer={prayer} userId={user.id} />
                    )}
                  {!hideActions &&
                    prayer.status !== PrayerRequestStatus.ANSWERED && (
                      <PrayerRequestDelete id={prayer.id} />
                    )}
                  <DropdownMenu open={isOpen} onOpenChange={setIsPopoverOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <EllipsisVertical />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      className="w-[130px] bg-white shadow-[0px_1px_5px_rgba(0,0,0,0.25)] rounded-md"
                      side="bottom"
                      align="end"
                    >
                      <DropdownMenuLabel>Mark As</DropdownMenuLabel>
                      <Separator />

                      {prayer.status !== PrayerRequestStatus.ANSWERED && (
                        <DropdownMenuItem asChild>
                          <Button
                            size="default"
                            variant="ghost"
                            className="px-2 py-1.5 text-sm w-full justify-start hover:bg-accent focus:outline-none focus:ring-0 focus-visible:ring-0 border-0"
                            onClick={() =>
                              handleUpdateStatus(PrayerRequestStatus.ANSWERED)
                            }
                          >
                            <Star className="h-4 w-4" />
                            Answered
                          </Button>
                        </DropdownMenuItem>
                      )}

                      {prayer.status !== PrayerRequestStatus.IN_PROGRESS && (
                        <DropdownMenuItem asChild>
                          <Button
                            size="default"
                            variant="ghost"
                            className="px-2 py-1.5 text-sm w-full justify-start hover:bg-accent focus:outline-none focus:ring-0 focus-visible:ring-0 border-0"
                            onClick={() =>
                              handleUpdateStatus(
                                PrayerRequestStatus.IN_PROGRESS
                              )
                            }
                          >
                            <Hand className="h-4 w-4" />
                            Requested
                          </Button>
                        </DropdownMenuItem>
                      )}

                      {prayer.status !== PrayerRequestStatus.ARCHIVED && (
                        <DropdownMenuItem asChild>
                          <Button
                            size="default"
                            variant="ghost"
                            className="px-2 py-1.5 text-sm w-full justify-start hover:bg-accent focus:outline-none focus:ring-0 focus-visible:ring-0 border-0"
                            onClick={() =>
                              handleUpdateStatus(PrayerRequestStatus.ARCHIVED)
                            }
                          >
                            <Package className="h-4 w-4" />
                            Archived
                          </Button>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className=" pb-0">
        <div>{prayer.request}</div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-row items-center justify-between mt-2">
          <div className="flex flex-col ">
            {prayer.status === PrayerRequestStatus.ANSWERED ? (
              <div className="text-sm font-semibold">
                Answered: {format(new Date(prayer.updatedAt), "MM/dd/yy")}
              </div>
            ) : (
              !isSameSecond(
                new Date(prayer.createdAt),
                new Date(prayer.updatedAt)
              ) && (
                <div className="text-xs">
                  Updated:{" "}
                  {format(new Date(prayer.updatedAt), "MM/dd/yy 'at' hh:mm a")}
                </div>
              )
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
