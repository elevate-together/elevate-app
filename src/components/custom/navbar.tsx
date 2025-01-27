"use client";

import { ThemeSwitch } from "@/components/custom/functions/theme-switch";
import { SidebarTrigger } from "@/components/ui/sidebar";
import PrayerGroupCreate from "./prayer-group/prayer-group-create";

export const Navbar = () => {
  return (
    <div className="flex flex-row justify-between w-full p-2">
      <div>
        <SidebarTrigger />
        <ThemeSwitch />
      </div>
      <PrayerGroupCreate />
    </div>
  );
};
