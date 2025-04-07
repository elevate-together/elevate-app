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
import { PrayerRequestStatus, User, type PrayerRequest } from "@prisma/client";
import { format, isSameSecond } from "date-fns";
import {
  Bell,
  Hand,
  HandHelpingIcon,
  Package,
  Star,
  Ellipsis,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import UserAvatar from "../user/user-avatar";
import PrayerRequestDelete from "./prayer-request-delete";
import PrayerRequestEdit from "./prayer-request-edit";
import {
  DropdownMenu,
  DropdownMenuContent,
} from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

type PrayerRequestCardProps = {
  prayer: PrayerRequest;
  user: User;
  isOwner?: boolean;
  currUserName?: string;
};

export default function PrayerRequestCard({
  prayer,
  user,
  isOwner = false,
  currUserName = "",
}: PrayerRequestCardProps) {
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

  return (
    <Card className="rounded-none mb-2 shadow border-none">
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
                  <Bell />
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <Ellipsis className="w-12 h-12" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className="w-[130px] bg-white shadow-[0px_1px_5px_rgba(0,0,0,0.25)] rounded-md"
                    side="bottom"
                    align="end"
                  >
                    <DropdownMenuLabel className="ml-1">
                      Prayer Actions
                    </DropdownMenuLabel>
                    <Separator />
                    {prayer.status === PrayerRequestStatus.IN_PROGRESS && (
                      <DropdownMenuItem asChild>
                        <PrayerRequestEdit
                          prayer={prayer}
                          userId={user.id}
                          includeText
                          className="px-2 py-1.5 text-sm w-full justify-start hover:bg-accent "
                        />
                      </DropdownMenuItem>
                    )}

                    {prayer.status !== PrayerRequestStatus.ANSWERED && (
                      <DropdownMenuItem asChild>
                        <PrayerRequestDelete
                          id={prayer.id}
                          includeText
                          className="px-2 py-1.5 text-sm w-full justify-start hover:bg-accent"
                        />
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
                          Archive
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
                            handleUpdateStatus(PrayerRequestStatus.IN_PROGRESS)
                          }
                        >
                          <Hand className="h-4 w-4" />
                          Request
                        </Button>
                      </DropdownMenuItem>
                    )}

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
                  </DropdownMenuContent>
                </DropdownMenu>
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
