"use client";

import { GroupType, User } from "@prisma/client";
import PrayerRequestCard from "../prayer-request/prayer-request-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import PrayerGroupEdit from "../prayer-group/prayer-group-edit";
import PrayerGroupMemberTable from "../prayer-group/prayer-group-member-table";
import {
  MinimalUser,
  PrayerGroupWithOwner,
  PrayerRequestWithUser,
} from "@/lib/utils";
import PrayerGroupPendingTable from "../prayer-group/prayer-group-pending-table";
import PrayerGroupOwnerSwitch from "../prayer-group/prayer-group-switch-user";

type Props = {
  prayerGroup: PrayerGroupWithOwner;
  currentUser: User;
  members: MinimalUser[];
  pendingUsers: User[];
  sharedRequests: PrayerRequestWithUser[];
  publicRequests: PrayerRequestWithUser[];
  isOwner: boolean;
};

export default function PrayerGroupTemplate({
  prayerGroup,
  currentUser,
  members,
  pendingUsers,
  sharedRequests,
  publicRequests,
  isOwner,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">{prayerGroup.name}</h1>
          <Badge variant="outline">
            {prayerGroup.groupType === GroupType.PRIVATE ? "Private" : "Public"}
          </Badge>
        </div>
        <div className="space-x-2">
          {isOwner && (
            <PrayerGroupEdit id={currentUser.id} group={prayerGroup} />
          )}
          {isOwner && (
            <PrayerGroupOwnerSwitch
              prayerGroup={prayerGroup}
              members={members}
            />
          )}
        </div>
      </div>

      <p className="text-md text-muted-foreground">{prayerGroup.description}</p>

      <Tabs defaultValue="requests">
        <TabsList className="p-0">
          <TabsTrigger value="requests">Prayer Requests</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          {isOwner && prayerGroup.groupType === GroupType.PRIVATE && (
            <TabsTrigger value="pending">Pending Members</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="requests">
          <div className="flex flex-col gap-4 py-1 px-2 mt-3">
            <div className="text-base font-bold">
              Prayer Requests Shared With This Group:
            </div>
            {sharedRequests.length > 0 ? (
              <div>
                {sharedRequests.map((prayer) => (
                  <PrayerRequestCard
                    key={prayer.id}
                    user={prayer.user}
                    prayer={prayer}
                    isOwner={false}
                    currUserName={currentUser.name}
                  />
                ))}
              </div>
            ) : (
              <div>{`${prayerGroup.name} doesn't have any shared prayer requests right now.`}</div>
            )}

            <Separator />

            <div className="text-base font-bold">Other Prayer Requests</div>
            {publicRequests.length > 0 ? (
              <div className="flex flex-col gap-3">
                {publicRequests.map((prayer) => (
                  <PrayerRequestCard
                    key={prayer.id}
                    user={prayer.user}
                    prayer={prayer}
                    isOwner={false}
                    currUserName={currentUser.name}
                  />
                ))}
              </div>
            ) : (
              <div>{`${prayerGroup.name} members don't have public prayer requests at the moment.`}</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="members">
          <div className="px-2 mt-3">
            <PrayerGroupMemberTable
              data={members}
              groupId={prayerGroup.id}
              ownerId={prayerGroup.ownerId}
              isOwner={isOwner}
            />
          </div>
        </TabsContent>

        {prayerGroup.groupType === GroupType.PRIVATE && (
          <TabsContent value="pending">
            <div className="px-2 mt-3">
              {pendingUsers.length > 0 ? (
                <PrayerGroupPendingTable
                  data={pendingUsers}
                  prayerGroup={prayerGroup}
                />
              ) : (
                <div className="text-muted-foreground text-sm">
                  {prayerGroup.name} has no member requests at this time.
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
