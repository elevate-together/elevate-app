import { PrayerGroup, User as UserDef } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { HelpingHandIcon, Home, User, Users } from "lucide-react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type PrayerGroupWithOwner = PrayerGroup & {
  owner: UserDef;
};

export const menu_items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    auth: false,
  },
  {
    title: "Profile",
    url: "/user/{id}",
    icon: User,
    auth: true,
  },
  {
    title: "Your Groups",
    url: "/groups",
    icon: Users,
    auth: true,
  },
  {
    title: "Your Requests",
    url: "/requests/{id}",
    icon: HelpingHandIcon,
    auth: true,
  },
];
