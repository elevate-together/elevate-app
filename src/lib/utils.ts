import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Home, User } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const menu_items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    auth: false,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
    auth: true,
  },
];
