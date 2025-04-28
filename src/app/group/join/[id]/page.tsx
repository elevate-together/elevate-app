import { auth } from "@/auth";
import { getPrayerGroupWithCountById } from "@/services/prayer-group";
import PrayerGroupJoin from "@/components/custom/prayer-group/join/prayer-group-join";
import PagePaddingWrapper from "@/components/custom/templates/helper/page-padding-wrapper";
import LogInPrompt from "@/components/custom/helpers/log-in-prompt";
import { getUserGroupStatus } from "@/services/user-prayer-group";
import PrayerGroupAccepted from "@/components/custom/prayer-group/status/prayer-group-accepted";
import PrayerGroupNotAccepted from "@/components/custom/prayer-group/status/prayer-group-not-accepted";
import PrayerGroupNotFound from "@/components/not-found/prayer-group";
import SessionNotFound from "@/components/not-found/session";

export default async function JoinGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: groupId } = await params;
  const session = await auth();
  if (!session) {
    return <LogInPrompt callback={`group/join/${groupId}`} />;
  }

  const userId = session?.user?.id;
  if (!userId) return <SessionNotFound />;

  const status = await getUserGroupStatus(groupId, userId);

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
      <PrayerGroupJoin userId={userId} group={group} />
    </PagePaddingWrapper>
  );
}
