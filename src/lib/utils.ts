import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Home, User, Users } from "lucide-react";

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
    url: "/profile/{id}",
    icon: User,
    auth: true,
  },
  {
    title: "Groups",
    url: "/groups",
    icon: Users,
    auth: true,
  },
];
