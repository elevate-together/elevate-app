"use client";

import { GroupType, User } from "@prisma/client";
import {
  DEFAULT_IMAGE_URL,
  PrayerGroupWithOwner,
  PrayerRequestWithUser,
} from "@/lib/utils";
import {
  Badge,
  RoundedImage,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import {
  PrayerGroupEdit,
  PrayerGroupJoinLink,
  PrayerGroupMemberTable,
  PrayerGroupOwnerChange,
  PrayerGroupPendingTable,
  PrayerRequestCreate,
  PrayerRequestCard,
  UserAvatar,
  UserLeaveGroup,
} from "@/components/data-handlers";
import { Session } from "next-auth";

type Props = {
  prayerGroup: PrayerGroupWithOwner;
  currentUser: Session["user"];
  members: Session["user"][];
  pendingUsers: User[];
  sharedRequests: PrayerRequestWithUser[];
  publicRequests: PrayerRequestWithUser[];
  isOwner: boolean;
};

export function PrayerGroupPageTemplate({
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
        <PrayerRequestCreate
          userId={currentUser.id}
          defaultGroupId={prayerGroup.id}
          variant="icon"
        />
        {isOwner && (
          <PrayerGroupEdit
            ownerId={currentUser.id}
            group={prayerGroup}
            variant="icon"
          />
        )}
        {isOwner && (
          <PrayerGroupOwnerChange
            prayerGroup={prayerGroup}
            members={members}
            variant="icon"
          />
        )}
        {!isOwner && (
          <UserLeaveGroup group={prayerGroup} userId={currentUser.id} />
        )}
        <PrayerGroupJoinLink prayerGroup={prayerGroup} variant="icon" />
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
                    currUser={currentUser}
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
                    currUser={currentUser}
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
