import { PrayerGroup, Prisma, User, ZoneType } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import moment from "moment-timezone";

import {
  Calendar,
  HelpingHandIcon,
  Home,
  User as UserIco,
  Users,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Session } from "next-auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type PrayerGroupWithOwner = PrayerGroup & {
  owner: Session["user"];
};

export type PrayerGroupWithOwnerAndCount = PrayerGroupWithOwner & {
  _count: { users: number };
};

export type PrayerGroupWithOwnerAndUsers = PrayerGroup & {
  owner: User;
  users: Pick<User, "name">[];
};

// export type Session["user"] = Pick<
//   User,
//   "id" | "name" | "email" | "image" | "createdAt"
// >;

export const DEFAULT_IMAGE_URL =
  "https://kpfusvtzlmxikzmu.public.blob.vercel-storage.com/apple-icon.png";

export type UserBasics = Pick<User, "id" | "name" | "email" | "image">;

export type ShareWithTypes = "public" | "private" | "group";

export type PrayerRequestWithUser = Prisma.PrayerRequestGetPayload<{
  include: { user: true };
}>;

export type ResponseMessage = {
  success: boolean;
  message: string;
};

export const menu_items = [
  {
    title: "Home",
    titleShort: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Your Groups",
    titleShort: "Groups",
    url: "/group",
    icon: Users,
  },
  {
    title: "Your Requests",
    titleShort: "Requests",
    url: "/request/{id}",
    icon: HelpingHandIcon,
  },
  {
    title: "Profile",
    titleShort: "Profile",
    url: "/user/{id}",
    icon: UserIco,
  },

  {
    title: "Your Reminders",
    titleShort: " Reminders",
    url: "/reminder",
    icon: Calendar,
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

export const timezoneMap: Record<string, string> = {
  LOSANGELES: "America/Los_Angeles",
  DENVER: "America/Denver",
  CHICAGO: "America/Chicago",
  NEWYORK: "America/New_York",
};

export const getIanafromEnumKey = (tzEnumValue: ZoneType) => {
  return timezoneMap[tzEnumValue] || tzEnumValue;
};

const reverseTimezoneMap = Object.fromEntries(
  Object.entries(timezoneMap).map(([key, value]) => [value, key])
);

export const getEnumKeyFromIana = (iana: string) => {
  return reverseTimezoneMap[iana] as ZoneType;
};

export function convertUTCToZoneTime(
  time24: string,
  zoneType: ZoneType
): string {
  const timeZone = getIanafromEnumKey(zoneType);

  const todayUtc = moment().utc().format("YYYY-MM-DD");

  const utcMoment = moment.tz(
    `${todayUtc} ${time24}`,
    "YYYY-MM-DD HH:mm",
    "UTC"
  );

  const zoneTime = utcMoment.clone().tz(timeZone);

  return zoneTime.format("HH:mm");
}

export function convertUTCToZoneTime12hr(
  time24: string,
  zoneType: ZoneType
): string {
  const time24Converted = convertUTCToZoneTime(time24, zoneType);

  const today = moment().format("YYYY-MM-DD");
  const timeMoment = moment(`${today} ${time24Converted}`, "YYYY-MM-DD HH:mm");

  return timeMoment.format("h:mm A"); // e.g., "1:45 PM"
}

export function convertZoneTimeToUTC(
  time24: string,
  zoneType: ZoneType
): string {
  const timeZone = getIanafromEnumKey(zoneType);

  const todayLocal = moment().tz(timeZone).format("YYYY-MM-DD");

  const localMoment = moment.tz(
    `${todayLocal} ${time24}`,
    "YYYY-MM-DD HH:mm",
    timeZone
  );

  const utcMoment = localMoment.clone().utc();

  return utcMoment.format("HH:mm");
}
