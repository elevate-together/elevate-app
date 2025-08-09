import { auth } from "@/auth";
import {
  PagePaddingWrapper,
  PrayerGroupAllPageTemplate,
  SessionNotFound,
} from "@/components/common";
import {
  getPrayerGroupsForUser,
  getPrayerGroupsPendingForUser,
} from "@/services/user-prayer-group";

export default async function AllGroupsPage() {
  const session = await auth();

  if (!session) return <SessionNotFound />;

  const [yourGroups, pendingGroups] = await Promise.all([
    getPrayerGroupsForUser(session.user.id),
    getPrayerGroupsPendingForUser(session.user.id),
  ]);

  return (
    <PagePaddingWrapper>
      <PrayerGroupAllPageTemplate
        user={session.user}
        yourGroups={yourGroups?.prayerGroups ?? []}
        pendingGroups={pendingGroups?.prayerGroups ?? []}
      />
    </PagePaddingWrapper>
  );
}
