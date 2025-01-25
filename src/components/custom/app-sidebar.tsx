"use client";

import { Home } from "lucide-react";
import { Users } from "lucide-react";
import Link from "next/link";
// import { useSidebar } from "@/components/ui/sidebar";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  // {
  //   title: "Profile",
  //   url: "/profile",
  //   icon: CircleUserRound,
  // },
];

export function AppSidebar() {
  // const { toggleSidebar } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader>
        {/* <div className="flex justify-between items-center mx-4 my-2"> */}
        <Link className="flex items-center justify-center m-4" href="/">
          <Users className="h-6 w-6" />
          <span className="ml-2 text-2xl font-bold">ELEVATE</span>
        </Link>
        {/* <ChevronLeft
            className="h-6 w-6 cursor-pointer"
            onClick={toggleSidebar}
          /> */}
        {/* </div> */}
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
