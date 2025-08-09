import { auth } from "@/auth";
import { getPrayerGroupsForUser } from "@/services/user-prayer-group";
import { SidebarClient } from "./sidebar-client";

export async function Sidebar() {
  const session = await auth();

  if (!session) {
    return null;
  }

  const { prayerGroups } = await getPrayerGroupsForUser(session.user.id);
  const userPrayerGroups = prayerGroups;

  return (
    <SidebarClient
      session={session}
      userPrayerGroups={userPrayerGroups ?? []}
    />
  );
}
