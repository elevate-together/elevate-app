"use server";

import PrayerGroupMemberTable from "@/components/custom/prayer-group/prayer-group-member-table";
import PrayerRequestCard from "@/components/custom/prayer-request/prayer-request-card";
import { Separator } from "@/components/ui/separator";
import { getPrayerGroupById } from "@/services/prayer-group";
import {
  getPendingUsersByPrayerGroup,
  getUsersByPrayerGroup,
} from "@/services/user-prayer-group";
import { auth } from "@/auth";
import { getUserById } from "@/services/users";
import { getPrayerRequestsForGroup } from "@/services/prayer-request-share";
import { getPublicPrayerRequestsForGroup } from "@/services/prayer-request-share";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GroupType, User } from "@prisma/client";
import PrayerGroupEdit from "@/components/custom/prayer-group/prayer-group-edit";
import PrayerGroupPendingTable from "@/components/custom/prayer-group/prayer-group-pending-table";

export default async function Group({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { prayerGroup } = await getPrayerGroupById(id);
  if (!prayerGroup) return null;

  const { users } = await getUsersByPrayerGroup(id);

  let pendingUsers: User[] = [];
  if (prayerGroup?.groupType === GroupType.PRIVATE) {
    const { users: pending } = await getPendingUsersByPrayerGroup(id);
    if (pending) {
      pendingUsers = pending;
    }
  }
  const { data: SharedWithGroupReq } = await getPrayerRequestsForGroup(id);
  const { data: publicPrayerRequests } = await getPublicPrayerRequestsForGroup(
    id
  );

  const session = await auth();

  // User is not signed in
  if (!session || !session.user) {
    return null;
  }

  // Getting current user info
  const userId = session?.user.id;

  if (!userId) {
    return <div>Error loading user data</div>;
  }

  const { user: currUser } = await getUserById(userId);

  const isOwner = prayerGroup?.owner.id === userId;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">{prayerGroup.name}</h1>
          <Badge variant="outline">
            {prayerGroup.groupType === GroupType.PRIVATE ? "Private" : "Public"}
          </Badge>
        </div>
        {isOwner && <PrayerGroupEdit id={userId} group={prayerGroup} />}
      </div>
      <p className="text-md text-muted-foreground">{prayerGroup.description}</p>
      <Tabs defaultValue="requests">
        <TabsList className="p-0">
          <TabsTrigger value="requests">Prayer Requests</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          {isOwner && prayerGroup.groupType === GroupType.PRIVATE && (
            <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="requests">
          <div className="flex flex-col gap-4 py-1 px-2">
            <div className="text-base font-bold">
              Prayer Requests Shared With This Group:
            </div>
            {SharedWithGroupReq ? (
              <div>
                <div className="flex flex-col gap-3">
                  {SharedWithGroupReq.map((prayer) => (
                    <PrayerRequestCard
                      key={prayer.prayerRequest.id}
                      user={prayer.user}
                      prayer={prayer.prayerRequest}
                      isOwner={false}
                      currUserName={currUser?.name ?? ""}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div>{`${prayerGroup.name} doesn't have any prayer requests shared with the group right now.`}</div>
            )}
            <Separator />
            <div className="text-base font-bold">Other Prayer Requests</div>
            {publicPrayerRequests?.length > 0 ? (
              <div>
                <div className="flex flex-col gap-3">
                  {publicPrayerRequests.map((prayer) => (
                    <PrayerRequestCard
                      key={prayer.prayerRequest.id}
                      user={prayer.user}
                      prayer={prayer.prayerRequest}
                      isOwner={false}
                      currUserName={currUser?.name ?? ""}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div>{`${prayerGroup.name} members don't have any public prayer requests at the moment.`}</div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="members">
          <div className="px-2">
            {users && (
              <PrayerGroupMemberTable
                data={users}
                groupId={prayerGroup.id}
                isOwner
              />
            )}
          </div>
        </TabsContent>
        {prayerGroup.groupType === GroupType.PRIVATE && (
          <TabsContent value="pending">
            {pendingUsers.length > 0 ? (
              <div className="px-2">
                <PrayerGroupPendingTable
                  data={pendingUsers}
                  groupId={prayerGroup.id}
                />
              </div>
            ) : (
              <div className="px-2 text-muted-foreground text-sm">
                No pending member requests at this time.
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
