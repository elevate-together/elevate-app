import { auth } from "@/auth";
import { getUserById } from "@/services/users";
import {
  getPrayerGroupsForUser,
  getPrayerGroupsPendingForUser,
} from "@/services/user-prayer-group";
import PrayerGroupAllTemplate from "@/components/custom/templates/prayer-group-all-template";
import PagePaddingWrapper from "@/components/custom/templates/page-padding-wrapper";

export default async function AllGroupsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <div>Error finding user</div>;
  }

  const { user } = await getUserById(userId);
  if (!user) {
    return <div className="p-2">Unable to Find User</div>;
  }

  const [yourGroups, pendingGroups] = await Promise.all([
    getPrayerGroupsForUser(user.id),
    getPrayerGroupsPendingForUser(user.id),
    // getPrayerGroupsNotIn(user.id),
  ]);

  return (
    <PagePaddingWrapper>
      <PrayerGroupAllTemplate
        user={user}
        yourGroups={yourGroups?.prayerGroups ?? []}
        pendingGroups={pendingGroups?.prayerGroups ?? []}
        // remainingGroups={remainingGroups?.prayerGroups ?? []}
      />
    </PagePaddingWrapper>
  );
}
