import { auth } from "@/auth";
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
import { menu_items as items } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import UserInfo from "./user/user-info";

export default async function AppSidebar() {
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          className="flex flex-row items-center justify-center mt-4"
          href="/"
        >
          {/* <Users className="h-6 w-6" /> */}
          <Image src="/people.png" alt="Elevate Logo" height={30} width={30} />
          <span className="ml-2 text-2xl font-bold">ELEVATE</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                // Replace placeholder `{id}` with actual user ID if applicable
                const url = item.url.replace("{id}", userId || "");

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      {item.auth ? (
                        session?.user ? (
                          <a href={url}>
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
                );
              })}
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
