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
  SidebarMenuSub,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { menu_items as items } from "@/lib/utils";
import { getPrayerGroupsForUser } from "@/services/user-prayer-group";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import PrayerGroupCreate from "./prayer-group/prayer-group-create";
import PrayerRequestCreate from "./prayer-request/prayer-request-add";
import UserInfo from "./user/user-info";

export default async function AppSidebar() {
  const session = await auth();

  const { id, name, email, image } = session?.user || {};

  if (!session || !id) {
    redirect("/");
  }

  const { prayerGroups: userPrayerGroups } = await getPrayerGroupsForUser(id);

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          className="flex flex-row items-center justify-center mt-4"
          href="/"
        >
          <Image src="/icon.png" alt="Elevate Logo" height={30} width={30} />
          <span className="ml-2 text-2xl font-bold">ELEVATE</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                // Replace placeholder `{id}` with actual user ID if applicable
                const url = item.url.replace("{id}", id || "");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      {item.auth ? (
                        session?.user ? (
                          <a href={url}>
                            <item.icon />
                            <span className="text-">{item.title}</span>
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

              <SidebarSeparator />

              {session && id && (
                <div>
                  <SidebarMenuItem>
                    <PrayerRequestCreate id={id} isMenu />
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <PrayerGroupCreate id={id} isMenu />
                  </SidebarMenuItem>
                </div>
              )}
              <SidebarSeparator />

              <SidebarHeader>
                <div className="font-semibold">Your Groups</div>
              </SidebarHeader>

              {userPrayerGroups &&
                userPrayerGroups.length > 0 &&
                userPrayerGroups.map((group) => (
                  <SidebarMenuSub key={group.id}>
                    <SidebarMenuButton>
                      <a href={`/groups/${group.id}`}>
                        <span className="text-">{group.name}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuSub>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserInfo
          name={name ?? ""}
          email={email ?? ""}
          image={image ?? ""}
          id={id ?? undefined}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
