"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import BackButton from "./functions/back-button";
import { Bell, Settings } from "lucide-react";
import { Button } from "../ui/button";
import PrayerRequestAdd from "./prayer-request/prayer-request-add";
import { getNotificationCountForUser } from "@/services/notification";
import { useEffect } from "react";
import { useNotificationStore } from "@/services/stores/notification";

type Props = {
  id: string;
  image?: string | null;
  name?: string | null;
  notificationCount: number | undefined;
};

export default function ClientNavbarUser({
  id,
  image,
  name,
  notificationCount,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const { count, setCount } = useNotificationStore();

  useEffect(() => {
    async function fetchCount() {
      const res = await getNotificationCountForUser(id);
      if (res.success) {
        setCount(res.count || 0);
      }
    }
    fetchCount();
  }, [id, setCount]);

  const isOnProfile = pathname === `/user/${id}`;
  const isOnHome = pathname === "/";
  const isOnGroups = pathname === "/groups";
  const isOnGroupHome =
    pathname.startsWith("/group/") && pathname.split("/").length === 3;
  const isOnUserPrayerRequests =
    pathname.startsWith("/requests/") && pathname.split("/").length === 3;
  const isNotifications = pathname === "/notifications";
  const isJoinGroup =
    pathname.startsWith("/group/join/") && pathname.split("/").length === 4;

  return (
    <div className="relative flex items-center justify-between bg-card w-full py-1 px-3 shadow-none md:flex">
      {isOnHome ? (
        <Link href={`/requests/${id}`}>
          <Avatar className="h-8 w-8 ml-1">
            <AvatarImage src={image ?? undefined} />
            <AvatarFallback>
              {name?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        </Link>
      ) : (
        <BackButton />
      )}

      <div className="absolute left-1/2 transform -translate-x-1/2 text-center font-bold">
        {isOnProfile
          ? "Settings"
          : isOnHome
          ? "Pray"
          : isOnGroups
          ? "Groups"
          : isOnGroupHome
          ? "Your Group"
          : isOnUserPrayerRequests
          ? "Your Requests"
          : isNotifications
          ? "Notifications"
          : isJoinGroup
          ? "Join Group"
          : "Hello"}
      </div>

      <div className="flex gap-1 items-center mr-1">
        <PrayerRequestAdd id={id} variant="ghost" className="h-9 w-9" />
        <Button
          variant="ghost"
          size="largeIcon"
          className="h-9 w-9"
          onClick={() => router.push(`/user/${id}`)}
        >
          <Settings className="h-8 w-8" />
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="largeIcon"
            className="h-9 w-9"
            onClick={() => router.push(`/notifications`)}
          >
            <Bell className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute top-2 right-3 translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center border border-card">
                {count > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
