"use client";

import { GroupType, User } from "@prisma/client";
import PrayerRequestCard from "@/components/custom/prayer-request/prayer-request-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import PrayerGroupEdit from "@/components/custom/prayer-group/handlers/prayer-group-edit";
import PrayerGroupMemberTable from "@/components/custom/prayer-group/prayer-group-member-table";
import {
  DEFAULT_IMAGE_URL,
  MinimalUser,
  PrayerGroupWithOwner,
  PrayerRequestWithUser,
} from "@/lib/utils";
import PrayerGroupPendingTable from "@/components/custom/prayer-group/prayer-group-pending-table";
import PrayerGroupOwnerSwitch from "@/components/custom/prayer-group/prayer-group-switch-user";
import PrayerGroupJoinLink from "@/components/custom/prayer-group/join/prayer-group-join-link";
import PrayerRequestAdd from "../prayer-request/handlers/prayer-request-add";
import RoundedImage from "@/components/ui/rounded-image";
import UserAvatar from "../user/user-avatar";
import UserLeaveGroup from "../user/buttons/user-leave-group";

type Props = {
  prayerGroup: PrayerGroupWithOwner;
  currentUser: User;
  members: MinimalUser[];
  pendingUsers: User[];
  sharedRequests: PrayerRequestWithUser[];
  publicRequests: PrayerRequestWithUser[];
  isOwner: boolean;
};

export default function PrayerGroupPageTemplate({
  prayerGroup,
  currentUser,
  members,
  pendingUsers,
  sharedRequests,
  publicRequests,
  isOwner,
}: Props) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="w-full">
        <div className="flex items-center justify-start gap-4 w-full">
          <RoundedImage
            src={prayerGroup.imageUrl ?? DEFAULT_IMAGE_URL}
            alt={prayerGroup.name || "Prayer Group Image"}
            priority
          />

          <div className="flex flex-col justify-start">
            <Badge variant="outline">
              {prayerGroup.groupType === GroupType.PRIVATE
                ? "Private Group"
                : "Public Group"}
            </Badge>
            <h1 className=" text-xl md:text-3xl font-bold leading-tight pt-2">
              {prayerGroup.name}
            </h1>
            <p className="text-sm md:text-md text-muted-foreground leading-none md:leading-tight">
              {prayerGroup.description}
            </p>
            <div className="flex gap-1 items-center pt-2 md:pt-3">
              <UserAvatar user={prayerGroup.owner} size="xsmall" />
              <p className="text-xs text-muted-foreground">(owner)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-x-2">
        <PrayerRequestAdd
          userId={currentUser.id}
          defaultGroupId={prayerGroup.id}
          variant="ghost"
        />
        {isOwner && (
          <PrayerGroupEdit
            ownerId={currentUser.id}
            group={prayerGroup}
            variant="ghost"
          />
        )}
        {isOwner && (
          <PrayerGroupOwnerSwitch
            prayerGroup={prayerGroup}
            members={members}
            variant="ghost"
          />
        )}
        {!isOwner && (
          <UserLeaveGroup group={prayerGroup} userId={currentUser.id} />
        )}
        <PrayerGroupJoinLink prayerGroup={prayerGroup} variant="ghost" />
      </div>
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
              <div className="flex flex-col">
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
              <div className="flex flex-col">
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
