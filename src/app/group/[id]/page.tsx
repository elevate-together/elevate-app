import { auth } from "@/auth";
import { getUserById } from "@/services/users";
import { getPrayerGroupById } from "@/services/prayer-group";
import {
  getUsersByPrayerGroup,
  getPendingUsersByPrayerGroup,
  getUserGroupStatus,
} from "@/services/user-prayer-group";
import {
  getPrayerRequestsForGroup,
  getPublicPrayerRequestsForGroup,
} from "@/services/prayer-request-share";
import PagePaddingWrapper from "@/components/custom/templates/page-padding-wrapper";
import PrayerGroupTemplate from "@/components/custom/templates/prayer-group-templates";
import PrayerGroupNotAccepted from "@/components/custom/prayer-group/prayer-group-not-accepted";
import PrayerGroupNotIn from "@/components/custom/prayer-group/prayer-group-not-in";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: groupId } = await params;

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <div>Error loading user data</div>;
  }

  const { user } = await getUserById(userId);
  if (!user) {
    return <div>Unable to find user</div>;
  }

  const groupStatus = await getUserGroupStatus(groupId, userId);

  if (groupStatus === "none") {
    return <PrayerGroupNotIn />;
  } else if (groupStatus === "pending") {
    return <PrayerGroupNotAccepted />;
  }

  const { prayerGroup } = await getPrayerGroupById(groupId);
  if (!prayerGroup) {
    return <div>Prayer group not found</div>;
  }

  const { users } = await getUsersByPrayerGroup(groupId);
  const { users: pendingUsers } =
    prayerGroup.groupType === "PRIVATE"
      ? await getPendingUsersByPrayerGroup(groupId)
      : { users: [] };

  const { prayerRequests: sharedRequests } = await getPrayerRequestsForGroup(
    groupId
  );
  const { prayerRequests: publicRequests } =
    await getPublicPrayerRequestsForGroup(groupId);

  const isOwner = prayerGroup.owner.id === userId;

  return (
    <PagePaddingWrapper>
      <PrayerGroupTemplate
        prayerGroup={prayerGroup}
        currentUser={user}
        members={users ?? []}
        pendingUsers={pendingUsers ?? []}
        sharedRequests={sharedRequests ?? []}
        publicRequests={publicRequests ?? []}
        isOwner={isOwner}
      />
    </PagePaddingWrapper>
  );
}
