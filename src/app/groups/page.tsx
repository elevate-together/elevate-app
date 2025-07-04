import { auth } from "@/auth";
import { getUserById } from "@/services/user";
import {
  getPrayerGroupsForUser,
  getPrayerGroupsPendingForUser,
} from "@/services/user-prayer-group";
import PrayerGroupAllPageTemplate from "@/components/custom/templates/prayer-group-all-page-template";
import PagePaddingWrapper from "@/components/custom/templates/helper/page-padding-wrapper";
import UserNotFound from "@/components/not-found/user";
import SessionNotFound from "@/components/not-found/session";

export default async function AllGroupsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return <SessionNotFound />;

  const { user } = await getUserById({ id: userId });
  if (!user) {
    return <UserNotFound />;
  }

  const [yourGroups, pendingGroups] = await Promise.all([
    getPrayerGroupsForUser(user.id),
    getPrayerGroupsPendingForUser(user.id),
  ]);

  return (
    <PagePaddingWrapper>
      <PrayerGroupAllPageTemplate
        user={user}
        yourGroups={yourGroups?.prayerGroups ?? []}
        pendingGroups={pendingGroups?.prayerGroups ?? []}
      />
    </PagePaddingWrapper>
  );
}
