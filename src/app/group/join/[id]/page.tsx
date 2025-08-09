import { auth } from "@/auth";
import {
  LogInPrompt,
  PagePaddingWrapper,
  PrayerGroupNotFound,
} from "@/components/common";
import {
  PrayerGroupAccepted,
  PrayerGroupJoin,
  PrayerGroupNotAccepted,
} from "@/components/data-handlers";
import { getPrayerGroupWithCountById } from "@/services/prayer-group";
import { getUserGroupStatus } from "@/services/user-prayer-group";

export default async function JoinGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: groupId } = await params;
  const session = await auth();
  if (!session) {
    return <LogInPrompt callback={`/group/join/${groupId}`} />;
  }

  const status = await getUserGroupStatus(groupId, session.user.id);

  if (status === "accepted") {
    return <PrayerGroupAccepted groupId={groupId} />;
  }

  if (status === "pending") {
    return <PrayerGroupNotAccepted />;
  }

  const { prayerGroup: group } = await getPrayerGroupWithCountById(groupId);
  if (!group) return <PrayerGroupNotFound />;

  return (
    <PagePaddingWrapper>
      <PrayerGroupJoin userId={session.user.id} group={group} />
    </PagePaddingWrapper>
  );
}
