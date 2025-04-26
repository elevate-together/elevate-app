"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import BackButton from "./functions/back-button";
import { Bell, Settings } from "lucide-react";
import { Button } from "../ui/button";
import PrayerRequestAdd from "./prayer-request/prayer-request-add";

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

  const isOnProfile = pathname === `/user/${id}`;
  const isOnHome = pathname === "/";
  const isOnGroups = pathname === "/groups";
  const isOnGroupHome =
    pathname.startsWith("/groups/") && pathname.split("/").length === 3;
  const isOnUserPrayerRequests =
    pathname.startsWith("/requests/") && pathname.split("/").length === 3;
  const isNotifications = pathname === "/notifications";

  return (
    <div className="relative flex items-center justify-between bg-card w-full py-1 px-3 shadow-none md:flex">
      {/* Left side */}
      {isOnHome ? (
        <Link href={`/requests/${id}`}>
          <Avatar className="h-9 w-9 w-9 ml-1">
            <AvatarImage src={image ?? undefined} />
            <AvatarFallback>
              {name?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        </Link>
      ) : (
        <BackButton />
      )}

      {/* Center text absolutely positioned */}
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
          : "Hello"}
      </div>

      {/* Right side */}
      <div className="flex gap-1 items-center mr-1">
        <PrayerRequestAdd id={id} variant="ghost" className="h-9 w-9" />
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9"
          onClick={() => router.push(`/user/${id}`)}
        >
          <Settings />
        </Button>
        <div className="relative">
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9"
            onClick={() => router.push(`/notifications`)}
          >
            <Bell />
            {notificationCount && notificationCount > 0 && (
              <span className="absolute top-2 right-3 translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
