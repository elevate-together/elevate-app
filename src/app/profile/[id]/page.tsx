import { PrayerGroupJoin } from "@/components/custom/prayer-group/prayer-group-join";
import { Separator } from "@/components/ui/separator";
import {
  getPrayerGroupsForUser,
  getPrayerGroupsNotIn,
} from "@/services/user-prayer-group";
import { getUserById } from "@/services/users";
import UserAvatar from "@/components/custom/user/user-avatar";
import UserLeaveGroup from "@/components/custom/functions/user-leave-group";

export default async function Profile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Fetch user details
  const { user } = await getUserById((await params).id);

  if (!user) {
    return <div className="p-2">Unable to Find User</div>;
  }

  // Get groups user is a part of
  const yourGroups = await getPrayerGroupsForUser(user.id);

  // Get groups user isn't part of
  const remainingGroups = await getPrayerGroupsNotIn(user.id);

  return (
    <div className="flex flex-col gap-6">
      {/* User Profile Section */}

      <UserAvatar
        name={user.name}
        image={user.image ?? undefined}
        email={user.email}
        size="large"
      />

      <Separator />

      {/* Your Groups Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Your Groups</h2>
        {yourGroups?.prayerGroups && yourGroups.prayerGroups.length > 0 ? (
          <div className="flex flex-col gap-2">
            {yourGroups.prayerGroups.map((group) => (
              <div
                key={group.id}
                className="flex flex-row items-center gap-3 justify-between p-4 rounded-lg border"
              >
                <div className="text-md font-semibold">
                  <h3>{group.name}</h3>
                </div>
                <UserLeaveGroup group={group} id={user.id} />
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
            <h2 className="text-lg font-semibold">Looking for a group?</h2>
            {/* Pass the remaining groups (user isn't part of) to JoinGroup */}
            <PrayerGroupJoin
              data={remainingGroups.prayerGroups}
              userId={user.id}
            />
          </div>
        )}
    </div>
  );
}
