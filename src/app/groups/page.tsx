import { auth } from "@/auth";
import PrayerGroupCreate from "@/components/custom/prayer-group/prayer-group-create";
import PrayerGroupJoin from "@/components/custom/prayer-group/prayer-group-join";
import PrayerGroupView from "@/components/custom/prayer-group/prayer-group-view";
import UserLeaveGroup from "@/components/custom/user/user-leave-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  getPrayerGroupsForUser,
  getPrayerGroupsNotIn,
  getPrayerGroupsPendingForUser,
} from "@/services/user-prayer-group";
import { getUserById } from "@/services/users";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { EllipsisVerticalIcon } from "lucide-react";

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
  const pendingGroups = await getPrayerGroupsPendingForUser(user.id);

  // Get groups user isn't part of
  const remainingGroups = await getPrayerGroupsNotIn(user.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <div className="text-xl font-semibold h-full">Your Groups</div>
        <PrayerGroupCreate id={user.id} />
      </div>

      <div className="flex flex-col gap-3">
        {yourGroups?.prayerGroups && yourGroups.prayerGroups.length > 0 && (
          <div className="flex flex-col gap-3">
            {yourGroups.prayerGroups.map((group) => (
              <div
                key={group.id}
                className=" bg-card flex flex-row items-center gap-3 justify-between p-4 rounded-lg border"
              >
                <div className="text-base font-semibold">
                  <h3>{group.name}</h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <EllipsisVerticalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="flex flex-col">
                      <DropdownMenuItem disabled>Actions</DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <PrayerGroupView id={group.id} />
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <UserLeaveGroup group={group} id={user.id} />
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}

        {pendingGroups?.prayerGroups &&
          pendingGroups.prayerGroups.length > 0 && (
            <div className="flex flex-col gap-3">
              {pendingGroups.prayerGroups.map((group) => (
                <div
                  key={group.id}
                  className=" bg-card flex flex-row items-center gap-3 justify-between p-4 rounded-lg border"
                >
                  <div className="text-base font-semibold items-center">
                    <h3>{group.name}</h3>
                  </div>
                  <div className="flex gap-1 items-center">
                    <Badge variant="outline">Pending Approval</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <EllipsisVerticalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <UserLeaveGroup
                            group={group}
                            id={user.id}
                            isRequested
                          />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
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
