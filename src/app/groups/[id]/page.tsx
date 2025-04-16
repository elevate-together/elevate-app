import { auth } from "@/auth";
import { getUserById } from "@/services/users";
import { getPrayerGroupById } from "@/services/prayer-group";
import {
  getUsersByPrayerGroup,
  getPendingUsersByPrayerGroup,
} from "@/services/user-prayer-group";
import {
  getPrayerRequestsForGroup,
  getPublicPrayerRequestsForGroup,
import PrayerGroupTemplate from "@/components/custom/templates/prayer-group-templates";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!prayerGroup) return null;
  const { id: groupId } = await params;

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return <div>Error loading user data</div>;

  const { user } = await getUserById(userId);
  if (!user) return <div>Unable to find user</div>;

  const { prayerGroup } = await getPrayerGroupById(groupId);
  if (!prayerGroup) return <div>Prayer group not found</div>;

  const { users } = await getUsersByPrayerGroup(groupId);
  const { users: pendingUsers } =
    prayerGroup.groupType === "PRIVATE"
      ? await getPendingUsersByPrayerGroup(groupId)
      : { users: [] };

  const { data: sharedRequests } = await getPrayerRequestsForGroup(groupId);
  const { data: publicRequests } = await getPublicPrayerRequestsForGroup(
    groupId
  );

  const isOwner = prayerGroup.owner.id === userId;

  return (
    <PrayerGroupTemplate
      prayerGroup={prayerGroup}
      currentUser={user}
      members={users ?? []}
      pendingUsers={pendingUsers ?? []}
      sharedRequests={sharedRequests ?? []}
      publicRequests={publicRequests ?? []}
      isOwner={isOwner}
    />
  );
}
