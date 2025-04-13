import { PrayerGroup, PrayerRequest, User as UserDef } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { HelpingHandIcon, Home, User, Users } from "lucide-react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type PrayerGroupForPreview = PrayerGroup & {
  owner: UserDef;
  memberCount: number;
};

export type PrayeRequestWithUser = PrayerRequest & { user: UserDef };

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
    icon: User,
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
  const base64 = (base64String + padding)
    .replace(/-/g, "+") // Replace '-' with '+'
    .replace(/_/g, "/"); // Replace '_' with '/'

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";
  const uint8Array = new Uint8Array(buffer); // Convert ArrayBuffer to Uint8Array
  return btoa(String.fromCharCode(...uint8Array)); // Convert Uint8Array to Base64
}
