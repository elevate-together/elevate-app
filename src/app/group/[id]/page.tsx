import { auth } from "@/auth";
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
import {
  PagePaddingWrapper,
  PrayerGroupNotFound,
  PrayerGroupPageTemplate,
  SessionNotFound,
} from "@/components/common";
import {
  PrayerGroupNotAccepted,
  PrayerGroupNotIn,
} from "@/components/data-handlers";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: groupId } = await params;

  const session = await auth();

  if (!session) {
    return <SessionNotFound />;
  }

  const { prayerGroup } = await getPrayerGroupById({ id: groupId });
  if (!prayerGroup) {
    return <PrayerGroupNotFound />;
  }

  const groupStatus = await getUserGroupStatus(groupId, session.user.id);

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

  const isOwner = prayerGroup.owner.id === session.user.id;

  return (
    <PagePaddingWrapper>
      <PrayerGroupPageTemplate
        prayerGroup={prayerGroup}
        currentUser={session.user}
        members={users ?? []}
        pendingUsers={pendingUsers ?? []}
        sharedRequests={sharedRequests ?? []}
        publicRequests={publicRequests ?? []}
        isOwner={isOwner}
      />
    </PagePaddingWrapper>
  );
}
