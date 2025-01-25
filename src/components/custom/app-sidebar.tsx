import { Users } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import UserInfo from "./user/user-info";
import { auth } from "@/auth";
import { menu_items as items } from "@/lib/utils";

export default async function AppSidebar() {
  const session = await auth();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link className="flex items-center justify-center mt-4" href="/">
          <Users className="h-6 w-6" />
          <span className="ml-2 text-2xl font-bold">ELEVATE</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.auth ? (
                      session?.user ? (
                        <a href={item.url}>
                          <item.icon width={16} />
                          <span>{item.title}</span>
                        </a>
                      ) : null
                    ) : (
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserInfo />
      </SidebarFooter>
    </Sidebar>
  );
}
