 import { PrayerGroupJoin } from "@/components/custom/prayer-group/prayer-group-join";
import UserProfile from "@/components/custom/user/user-profile";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  getPrayerGroupsForUser,
  getPrayerGroupsNotIn,
} from "@/services/user-prayer-group";
import { getUserById } from "@/services/users";
import { LogOut } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
      <UserProfile {...user} />

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

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="icon">
                      <LogOut />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        Are your sure you want to leave {group.name}
                      </DialogTitle>
                      <DialogDescription>
                        This will remove you from <b>{group.name}</b>, and you
                        won’t be able to view its information. You can rejoin
                        later if you change your mind. Confirm if you wish to
                        proceed.
                      </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                      <div className="flex gap-3">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Leave Group</Button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        ) : (
          <div>You are not part of any groups.</div>
        )}
      </div>

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
