import {
  PrayerGroup,
  PrayerRequest,
  User,
  User as UserDef,
} from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { HelpingHandIcon, Home, User as UserIco, Users } from "lucide-react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type PrayerGroupWithOwner = PrayerGroup & {
  owner: UserDef;
};

export type PrayerGroupWithOwnerAndCount = PrayerGroupWithOwner & {
  _count: { users: number };
};

export type PrayerGroupWithOwnerAndUsers = PrayerGroup & {
  owner: UserDef;
  users: Pick<UserDef, "name">[];
};

export type MinimalUser = Pick<
  User,
  "id" | "name" | "email" | "image" | "createdAt"
>;

export type PrayerRequestWithUser = PrayerRequest & { user: UserDef };

export type ResponseMessage = {
  success: boolean;
  message: string;
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
    icon: UserIco,
    auth: true,
  },

  {
    title: "Your Requests",
    url: "/requests/{id}",
    icon: HelpingHandIcon,
    auth: true,
  },
  {
    title: "Find a Group",
    url: "/groups",
    icon: Users,
    auth: true,
  },
];

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";
  const uint8Array = new Uint8Array(buffer);
  return btoa(String.fromCharCode(...uint8Array));
}
