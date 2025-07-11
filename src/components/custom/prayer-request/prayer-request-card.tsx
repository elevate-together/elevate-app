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
  Hand,
  HandHelpingIcon,
  Package,
  Star,
  Loader,
  Check,
  HelpingHand,
  User as UserIco,
  EllipsisVertical,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import UserAvatar from "@/components/custom/user/user-avatar";
import PrayerRequestDelete from "@/components/custom/prayer-request/prayer-request-delete";
import PrayerRequestEdit from "@/components/custom/prayer-request/handlers/prayer-request-edit";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import ReminderAdd from "../reminder/handlers/reminder-add";

type PrayerRequestCardProps = {
  prayer: PrayerRequest;
  user: User;
  isOwner?: boolean;
  currUser?: User;
  hideActions?: boolean;
};

export default function PrayerRequestCard({
  prayer,
  user,
  isOwner = false,
  currUser,
  hideActions = false,
}: PrayerRequestCardProps) {
  const router = useRouter();
  const [isOpen, setIsPopoverOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);

  const handleSendNotification = async () => {
    setNotificationLoading(true);
    const currUserName = currUser?.name || "";
    const title =
      currUserName != ""
        ? currUserName.includes(" ")
          ? `${currUserName.split(" ")[0]} prayed for you!`
          : `${currUserName} prayed for you!`
        : "Someone prayed for you!";
    const message = `${currUserName} prayed for ${prayer.request} `;
    const link = `/requests/${user.id}`;
    const result = await sendNotificationAllDevices({
      userId: user.id,
      message,
      notificationType: NotificationType.PRAYER,
      notificationLink: link,
      title,
    });

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
    const result = await updatePrayerRequestStatus({
      prayerRequestId: prayer.id,
      newStatus: status,
    });

    if (result.success) {
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Card className="rounded-none mb-1 shadow border-none">
      <CardHeader className="pb-0">
        <CardTitle>
          <div className="flex justify-between items-start">
            <UserAvatar
              user={user}
              size="small"
              secondLine={
                <span className="flex items-center gap-1">
                  <HandHelpingIcon className="w-4 h-4" />
                  {format(new Date(prayer.createdAt), "PPP")}
                </span>
              }
              boldName
            />
            <div className="flex flex-row justify-between items-start gap-0">
              {isOwner ? (
                !hideActions &&
                prayer.status === PrayerRequestStatus.IN_PROGRESS && (
                  <PrayerRequestEdit
                    prayer={prayer}
                    userId={user.id}
                    includeText
                  />
                )
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSendNotification}
                >
                  {notificationLoading ? (
                    <Loader className="animate-spin" />
                  ) : notificationSuccess ? (
                    <Check />
                  ) : (
                    <HelpingHand />
                  )}
                  {notificationSuccess ? "Prayed" : "Pray"}
                </Button>
              )}

              {!isOwner ? (
                <div>
                  <DropdownMenu open={isOpen} onOpenChange={setIsPopoverOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <EllipsisVertical />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      className="bg-white shadow-[0px_1px_5px_rgba(0,0,0,0.25)] rounded-md"
                      side="bottom"
                      align="end"
                    >
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>

                      <DropdownMenuItem asChild>
                        <Button
                          variant="ghost"
                          size="default"
                          className="px-2 py-1.5 text-sm w-full justify-start hover:bg-accent focus:outline-none focus:ring-0 focus-visible:ring-0 border-0"
                        >
                          <UserIco />
                          View Profile
                        </Button>
                      </DropdownMenuItem>

                      {prayer.status !== PrayerRequestStatus.ANSWERED &&
                        currUser?.id && (
                          <DropdownMenuItem asChild>
                            <ReminderAdd
                              user={currUser}
                              reminderTitle={`Pray for ${user.name}`}
                              reminderText={`Take a moment to pray for "${prayer.request}"`}
                              className="px-2 py-1.5 text-sm w-full justify-start hover:bg-accent focus:outline-none focus:ring-0 focus-visible:ring-0 border-0"
                            />
                          </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div>
                  <DropdownMenu open={isOpen} onOpenChange={setIsPopoverOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <EllipsisVertical />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      className="bg-white shadow-[0px_1px_5px_rgba(0,0,0,0.25)] rounded-md"
                      side="bottom"
                      align="end"
                    >
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>

                      {!hideActions &&
                        prayer.status !== PrayerRequestStatus.ANSWERED && (
                          <DropdownMenuItem asChild>
                            <PrayerRequestDelete
                              requestId={prayer.id}
                              includeText
                              className="px-2 py-1.5 text-sm w-full justify-start hover:bg-accent focus:outline-none focus:ring-0 focus-visible:ring-0 border-0"
                            />
                          </DropdownMenuItem>
                        )}

                      {!hideActions &&
                        prayer.status !== PrayerRequestStatus.ANSWERED && (
                          <DropdownMenuItem asChild>
                            <ReminderAdd
                              user={user}
                              reminderTitle={`Prayer Reminder`}
                              reminderText={`Take a moment to pray for "${prayer.request}"`}
                              className="px-2 py-1.5 text-sm w-full justify-start hover:bg-accent focus:outline-none focus:ring-0 focus-visible:ring-0 border-0"
                            />
                          </DropdownMenuItem>
                        )}

                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Mark As</DropdownMenuLabel>

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
                            // className="px-2 py-1.5 text-sm w-full justify-start hover:bg-accent focus:outline-none focus:ring-0 focus-visible:ring-0 border-0"
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
      <CardContent className="py-2 px-6 mt-2">
        <div className="flex flex-col gap-1">
          <div>{prayer.request}</div>
          <div className="flex flex-col ">
            {prayer.status === PrayerRequestStatus.ANSWERED ? (
              <div className="text-xs font-semibold">
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
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
