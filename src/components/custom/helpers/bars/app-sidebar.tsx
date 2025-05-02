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
import { menu_items as items, UserBasics } from "@/lib/utils";
import { getPrayerGroupsForUser } from "@/services/user-prayer-group";
import Image from "next/image";
import Link from "next/link";
import PrayerGroupCreate from "@/components/custom/prayer-group/handlers/prayer-group-create";
import PrayerRequestAdd from "@/components/custom/prayer-request/handlers/prayer-request-add";
import UserInfo from "@/components/custom/user/user-info";

export default async function AppSidebar() {
  const session = await auth();

  if (
    !session ||
    !session.user ||
    !session.user.id ||
    !session.user.image ||
    !session.user.email ||
    !session.user.name
  ) {
    return null;
  }

  const user = session.user as UserBasics;
  const id = user.id;

  let userPrayerGroups;
  if (id) {
    const { prayerGroups } = await getPrayerGroupsForUser(id);
    userPrayerGroups = prayerGroups;
  }

  return (
    <div className="hidden md:block">
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
                  const url = item.url.replace("{id}", id || "");
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        {item.auth ? (
                          session.user ? (
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

                <div>
                  <SidebarMenuItem>
                    <PrayerRequestAdd userId={id} isMenu />
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <PrayerGroupCreate groupId={id} isMenu />
                  </SidebarMenuItem>
                  <SidebarSeparator />
                </div>

                {userPrayerGroups && userPrayerGroups.length > 0 && (
                  <div>
                    <SidebarHeader>
                      <div className="font-semibold">Your Groups</div>
                    </SidebarHeader>

                    {userPrayerGroups.map((group) => (
                      <SidebarMenuSub key={group.id}>
                        <SidebarMenuButton>
                          <a href={`/group/${group.id}`}>
                            <span className="text-">{group.name}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuSub>
                    ))}
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <UserInfo user={user} />
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
