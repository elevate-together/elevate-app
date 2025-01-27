"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitch } from "@/components/custom/buttons/theme-switch";
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
