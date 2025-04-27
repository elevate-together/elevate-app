import { auth } from "@/auth";
import { getPrayerGroupWithCountById } from "@/services/prayer-group";
import PrayerGroupJoin from "@/components/custom/prayer-group/prayer-group-join";
import PagePaddingWrapper from "@/components/custom/templates/page-padding-wrapper";
import LogInPrompt from "@/components/custom/functions/log-in-prompt";
import { permanentRedirect } from "next/navigation";
import { getUserGroupStatus } from "@/services/user-prayer-group";

export default async function JoinGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: groupId } = await params; // Make sure this is resolved
  const session = await auth(); // Get session
  if (!session) {
    return <LogInPrompt callback={`group/join/${groupId}`} />;
  }

  const userId = session?.user?.id;
  if (!userId) return <div>Error loading group data</div>;

  const status = await getUserGroupStatus(groupId, userId);

  if (status === "accepted" || status === "pending") {
    permanentRedirect(`/group/${groupId}`);
  }

  const { prayerGroup: group } = await getPrayerGroupWithCountById(groupId);
  if (!group) return <div>Error loading group data</div>;

  return (
    <PagePaddingWrapper>
      <PrayerGroupJoin userId={userId} group={group} />
    </PagePaddingWrapper>
  );
}
