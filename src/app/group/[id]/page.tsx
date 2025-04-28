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
import PagePaddingWrapper from "@/components/custom/templates/helper/page-padding-wrapper";
import PrayerGroupPageTemplate from "@/components/custom/templates/prayer-group-page-templates";
import PrayerGroupNotAccepted from "@/components/custom/prayer-group/status/prayer-group-not-accepted";
import PrayerGroupNotIn from "@/components/custom/prayer-group/status/prayer-group-not-in";
import UserNotFound from "@/components/not-found/user";
import PrayerGroupNotFound from "@/components/not-found/prayer-group";
import SessionNotFound from "@/components/not-found/session";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: groupId } = await params;

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <SessionNotFound />;
  }

  const { user } = await getUserById(userId);
  if (!user) {
    return <UserNotFound />;
  }

  const { prayerGroup } = await getPrayerGroupById(groupId);
  if (!prayerGroup) {
    return <PrayerGroupNotFound />;
  }

  const groupStatus = await getUserGroupStatus(groupId, userId);

  if (groupStatus === "none") {
    return <PrayerGroupNotIn />;
  } else if (groupStatus === "pending") {
    return <PrayerGroupNotAccepted />;
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
      <PrayerGroupPageTemplate
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
