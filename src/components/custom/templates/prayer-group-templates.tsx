// components/custom/prayer-group/prayer-group-template.tsx

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
  PrayerGroupForPreview,
  PrayerRequestWithUser,
} from "@/lib/utils";
import PrayerGroupPendingTable from "../prayer-group/prayer-group-pending-table";

type Props = {
  prayerGroup: PrayerGroupForPreview;
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
        {isOwner && <PrayerGroupEdit id={currentUser.id} group={prayerGroup} />}
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
            {sharedRequests.length > 0 ? (
              <div className="flex flex-col gap-3">
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
          <div className="px-2">
            <PrayerGroupMemberTable
              data={members}
              groupId={prayerGroup.id}
              isOwner={isOwner}
            />
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
