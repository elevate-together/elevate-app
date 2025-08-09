"use client";

import { menu_items as items } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PrayerGroup } from "@prisma/client";
import { Session } from "next-auth";
import { EllipsisVertical } from "lucide-react";
import { MenuDropdownButton, SidebarButton } from "@/components/common";
import {
  PrayerGroupCreate,
  PrayerRequestCreate,
  ReminderAdd,
  SignOut,
  UserAvatar,
} from "@/components/data-handlers";

import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui";

interface SidebarClientProps {
  session: Session;
  userPrayerGroups: PrayerGroup[];
}

export function SidebarClient({
  session,
  userPrayerGroups,
}: SidebarClientProps) {
  const router = useRouter();

  if (!session) return null;

  const user = session.user;

  return (
    <div className="hidden md:flex flex-col min-h-screen justify-between border-r border-gray-200 bg-gray-50 p-2 w-auto">
      <div>
        <div className="flex items-center justify-center space-x-2 mt-4 px-2 py-2 w-auto">
          <Image src="/icon.png" alt="Elevate Logo" height={30} width={30} />
          <h1 className="text-2xl font-bold">ELEVATE</h1>
        </div>
        <div className="flex flex-col gap-1 px-2">
          {items.map((item) => {
            const url = item.url.replace("{id}", user.id || "");
            return (
              <SidebarButton key={item.title} onClick={() => router.push(url)}>
                <item.icon />
                {item.title}
              </SidebarButton>
            );
          })}

          <SidebarSeparator />

          <PrayerRequestCreate userId={user.id} variant="menu" />
          <PrayerGroupCreate userId={user.id} variant="menu" />
          <ReminderAdd user={user} variant="menu" />

          <SidebarSeparator />

          <div className="px-2 py-2">
            <h2 className="font-bold text-sm">Your Groups</h2>
          </div>

          {userPrayerGroups && userPrayerGroups.length > 0 && (
            <div className="flex flex-col ml-3 pl-2 border-l border-gray-200 bg-gray-50">
              {userPrayerGroups.map((group) => (
                <SidebarButton
                  key={group.id}
                  onClick={() => router.push(`/group/${group.id}`)}
                  className="w-full justify-start"
                >
                  <span>{group.name}</span>
                </SidebarButton>
              ))}
            </div>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center space-between gap-6 py-6 px-3">
            <UserAvatar user={session.user} includeEmail />
            <EllipsisVertical className="w-5 h-5" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          sideOffset={5}
          className="w-auto space-y-1 rounded-md border border-gray-200 bg-white p-2 shadow-md max-w-60"
        >
          <UserAvatar
            user={session.user}
            size="small"
            includeEmail
            className="py-2 px-1"
          />
          <Separator />
          {items.map((item) => {
            const url = item.url.replace("{id}", user.id || "");
            return (
              <MenuDropdownButton
                key={item.title}
                onClick={() => router.push(url)}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.title}
              </MenuDropdownButton>
            );
          })}
          <Separator />
          <SignOut />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function SidebarSeparator() {
  return (
    <div className="flex justify-center">
      <Separator className="h-px w-[90%] bg-gray-200" />
    </div>
  );
}
