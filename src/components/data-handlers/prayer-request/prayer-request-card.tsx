"use client";

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui";
import { sendNotificationAllDevices } from "@/services/device";
import { updatePrayerRequestStatus } from "@/services/prayer-request";
import {
  NotificationType,
  PrayerRequestStatus,
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
import {
  PrayerRequestDelete,
  PrayerRequestEdit,
  ReminderAdd,
  UserAvatar,
} from "@/components/data-handlers";
import { useState } from "react";
import { SidebarButton } from "@/components/common";
import { Session } from "next-auth";

type PrayerRequestCardProps = {
  prayer: PrayerRequest;
  user: Session["user"];
  isOwner?: boolean;
  currUser?: Session["user"];
  hideActions?: boolean;
};

export function PrayerRequestCard({
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
                    variant="icon"
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

                    <DropdownMenuContent side="bottom" align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>

                      <DropdownMenuItem asChild>
                        <SidebarButton
                          onClick={() => router.push(`/user/${prayer.userId}`)}
                        >
                          <UserIco />
                          View Profile
                        </SidebarButton>
                      </DropdownMenuItem>

                      {prayer.status !== PrayerRequestStatus.ANSWERED &&
                        currUser?.id && (
                          <DropdownMenuItem asChild>
                            <ReminderAdd
                              user={currUser}
                              reminderTitle={`Pray for ${user.name}`}
                              reminderText={`Take a moment to pray for "${prayer.request}"`}
                              variant="menu"
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

                    <DropdownMenuContent side="bottom" align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>

                      {!hideActions &&
                        prayer.status !== PrayerRequestStatus.ANSWERED && (
                          <DropdownMenuItem asChild>
                            <PrayerRequestDelete
                              requestId={prayer.id}
                              variant="menu"
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
                              variant="menu"
                            />
                          </DropdownMenuItem>
                        )}

                      <DropdownMenuSeparator />

                      <DropdownMenuLabel>Mark As</DropdownMenuLabel>

                      {prayer.status !== PrayerRequestStatus.ANSWERED && (
                        <DropdownMenuItem asChild>
                          <SidebarButton
                            onClick={() =>
                              handleUpdateStatus(PrayerRequestStatus.ANSWERED)
                            }
                          >
                            <Star />
                            Answered
                          </SidebarButton>
                        </DropdownMenuItem>
                      )}

                      {prayer.status !== PrayerRequestStatus.IN_PROGRESS && (
                        <DropdownMenuItem asChild>
                          <SidebarButton
                            onClick={() =>
                              handleUpdateStatus(
                                PrayerRequestStatus.IN_PROGRESS
                              )
                            }
                          >
                            <Hand />
                            Requested
                          </SidebarButton>
                        </DropdownMenuItem>
                      )}

                      {prayer.status !== PrayerRequestStatus.ARCHIVED && (
                        <DropdownMenuItem asChild>
                          <SidebarButton
                            onClick={() =>
                              handleUpdateStatus(PrayerRequestStatus.ARCHIVED)
                            }
                          >
                            <Package />
                            Archived
                          </SidebarButton>
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
