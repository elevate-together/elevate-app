import { auth } from "@/auth";
import PrayerGroupCreate from "@/components/custom/prayer-group/prayer-group-create";
import PrayerGroupJoin from "@/components/custom/prayer-group/prayer-group-join";
import PrayerGroupView from "@/components/custom/prayer-group/prayer-group-view";
import UserLeaveGroup from "@/components/custom/user/user-leave-group";
import { Separator } from "@/components/ui/separator";
import {
  getPrayerGroupsForUser,
  getPrayerGroupsNotIn,
} from "@/services/user-prayer-group";
import { getUserById } from "@/services/users";

export default async function AllGroups() {
  const session = await auth();
  const { id } = { ...session?.user };

  if (!id) {
    return <div>Error finding user</div>;
  }

  const { user } = await getUserById(id);

  if (!user) {
    return <div className="p-2">Unable to Find User</div>;
  }

  // Get groups user is a part of
  const yourGroups = await getPrayerGroupsForUser(user.id);

  // Get groups user isn't part of
  const remainingGroups = await getPrayerGroupsNotIn(user.id);

  return (
    <div className="flex flex-col gap-6">
      {/* Your Groups Section */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center justify-between">
          <div className="text-xl font-semibold h-full">Your Groups</div>
          <PrayerGroupCreate id={user.id} hideOnMobile />
        </div>
        {yourGroups?.prayerGroups && yourGroups.prayerGroups.length > 0 ? (
          <div className="flex flex-col gap-2">
            {yourGroups.prayerGroups.map((group) => (
              <div
                key={group.id}
                className="flex flex-row items-center gap-3 justify-between p-4 rounded-lg border"
              >
                <div className="text-base font-semibold">
                  <h3>{group.name}</h3>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <UserLeaveGroup group={group} id={user.id} />
                  <PrayerGroupView id={group.id} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>You are currently not part of any groups.</div>
        )}
      </div>

      <Separator />

      {/* Remaining Groups Section */}
      {remainingGroups?.prayerGroups &&
        remainingGroups.prayerGroups.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold">Looking for your group?</h2>
            <PrayerGroupJoin
              data={remainingGroups.prayerGroups}
              userId={user.id}
            />
          </div>
        )}
    </div>
  );
}
