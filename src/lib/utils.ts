import {
  PrayerGroup,
  PrayerRequest,
  TimezoneType,
  User,
  User as UserDef,
} from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { getTimezoneOffset } from "date-fns-tz";
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

export type UserBasics = Pick<User, "id" | "name" | "email" | "image">;

export type ShareWithTypes = "public" | "private" | "group";

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
    title: "Your Groups",
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

export function getLocalTimeAndMeridiem(
  utcTime: string,
  offset: number
): { time: string; meridiem: "AM" | "PM" } {
  const [utcHourStr, utcMinuteStr] = utcTime.split(":");
  let hour = parseInt(utcHourStr, 10);
  const minute = parseInt(utcMinuteStr, 10);

  hour += offset;
  if (hour >= 24) hour -= 24;
  if (hour < 0) hour += 24;

  const meridiem = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, "0");

  const time = `${displayHour.toString().padStart(2, "0")}:${displayMinute}`;
  return { time, meridiem };
}

export function getLocalTimeAndMeridiemFromTimeZone({
  utcTime,
  timeZone,
}: {
  utcTime: string;
  timeZone: string;
}) {
  const now = new Date();
  const offset = getTimezoneOffset(timeZone, now) / 3600000;
  const [utcHourStr, utcMinuteStr] = utcTime.split(":");
  let hour = parseInt(utcHourStr, 10);
  const minute = parseInt(utcMinuteStr, 10);

  hour += offset;
  if (hour >= 24) hour -= 24;
  if (hour < 0) hour += 24;

  const meridiem: "AM" | "PM" = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, "0");

  const time = `${displayHour.toString().padStart(2, "0")}:${displayMinute}`;
  return { time, meridiem };
}

const timeZoneMap = {
  America_Los_Angeles: "America/Los_Angeles",
  America_Denver: "America/Denver",
  America_Chicago: "America/Chicago",
  America_New_York: "America/New_York",
} as const;

export function getMappedTimeZone(tz: TimezoneType): string {
  return timeZoneMap[tz];
}
