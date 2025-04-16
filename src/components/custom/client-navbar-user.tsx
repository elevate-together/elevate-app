"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import BackButton from "./functions/back-button";
import { Settings } from "lucide-react";
import { Button } from "../ui/button";
import PrayerRequestAdd from "./prayer-request/prayer-request-add";

type Props = {
  navbarUser: {
    id: string;
    image?: string | null;
    name?: string | null;
  };
};

export default function ClientNavbarUser({ navbarUser }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const isOnProfile = pathname === `/user/${navbarUser.id}`;
  const isOnHome = pathname === "/";
  const isOnGroups = pathname === "/groups";
  const isOnGroupHome =
    pathname.startsWith("/groups/") && pathname.split("/").length === 3;
  const isOnUserPrayerRequests =
    pathname.startsWith("/requests/") && pathname.split("/").length === 3;

  return (
    <div className="relative flex items-center justify-between bg-card w-full py-1 px-3 shadow-none md:flex">
      {/* Left side */}
      {isOnHome ? (
        <Link href={`/requests/${navbarUser.id}`}>
          <Avatar className="h-7 w-7 ml-1">
            <AvatarImage src={navbarUser.image ?? undefined} />
            <AvatarFallback>
              {navbarUser.name?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        </Link>
      ) : (
        <BackButton className="px-2 py-1 h-8" />
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
          : "Hello"}
      </div>

      {/* Right side */}
      <div className="flex gap-1 items-center mr-1">
        <PrayerRequestAdd
          id={navbarUser.id}
          variant="ghost"
          className="h-8 w-8"
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => router.push(`/user/${navbarUser.id}`)}
        >
          <Settings />
        </Button>
      </div>
    </div>
  );
}
