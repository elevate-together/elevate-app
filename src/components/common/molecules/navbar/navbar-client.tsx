"use client";

import { Session } from "next-auth";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Settings } from "lucide-react";
import { BackButton, IconButton } from "@/components/common";
import { PrayerRequestCreate, UserAvatar } from "@/components/data-handlers";

interface NavbarClientProps {
  session: Session;
  notificationCount: number;
}

export function NavbarClient({ session }: NavbarClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  const routeTitles: { match: (path: string) => boolean; title: string }[] = [
    { match: (p) => p === "/", title: "Pray" },
    { match: (p) => p === `/user/${session.user.id}`, title: "Settings" },
    { match: (p) => p === "/group", title: "Your Groups" },
    {
      match: (p) => p.startsWith("/group/") && p.split("/").length === 3,
      title: "Your Group",
    },
    {
      match: (p) => p.startsWith("/request/") && p.split("/").length === 3,
      title: "Your Requests",
    },
    { match: (p) => p === "/notifications", title: "Notifications" },
    {
      match: (p) => p.startsWith("/group/join/") && p.split("/").length === 4,
      title: "Join Group",
    },
    {
      match: (p) => p.startsWith("/reminder/") && p.split("/").length === 3,
      title: "Reminders",
    },
  ];

  const currentTitle =
    routeTitles.find((route) => route.match(pathname))?.title || "";

  if (!session) return null;

  const user = session.user;
  const isOnHome = pathname === "/";

  return (
    <div className="block md:hidden border-b border-border px-4 py-1 flex justify-between items-center">
      <div>
        {isOnHome ? (
          <UserAvatar user={session.user} size="xsmall" />
        ) : (
          <BackButton />
        )}
      </div>

      <h1 className="font-bold text-lg truncate max-w-[50%] text-center">
        {currentTitle}
      </h1>

      <div className="flex items-center">
        <PrayerRequestCreate userId={user.id} variant="largeIcon" />

        <IconButton
          onClick={() => router.push(`/user/${user.id}`)}
          aria-label="Settings"
          size="largeIcon"
        >
          <Settings />
        </IconButton>

        <IconButton
          onClick={() => router.push("/notification")}
          aria-label="Notifications"
          size="largeIcon"
        >
          <Bell />
        </IconButton>
      </div>
    </div>
  );
}
