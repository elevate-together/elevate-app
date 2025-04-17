// "use client" directive for client-side rendering
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PrayerRequestCard from "@/components/custom/prayer-request/prayer-request-card";
import { PullToRefreshWrapper } from "@/components/custom/functions/pull-to-refresh-wrapper";
import { PrayeRequestWithUser } from "@/lib/utils";
import { PrayerRequest, User } from "@prisma/client";

interface HomeClientTemplateProps {
  user: User;
  friendPrayerRequests: PrayeRequestWithUser[]; // Array of friend prayer requests
  inProgressPrayerRequests: PrayerRequest[]; // Array of in-progress prayer requests
  friendSuccess: boolean;
  inProgressSuccess: boolean;
}

export const HomPagetemplate = ({
  user,
  friendPrayerRequests,
  inProgressPrayerRequests,
  friendSuccess,
  inProgressSuccess,
}: HomeClientTemplateProps) => {
  const isStandAlone =
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches;

  return (
    <Tabs
      defaultValue={
        friendPrayerRequests && friendPrayerRequests?.length > 0
          ? "community"
          : "personal"
      }
    >
      <TabsList variant="fullWidth">
        {inProgressSuccess && inProgressPrayerRequests.length > 0 && (
          <TabsTrigger value="all" variant="underline">
            All
          </TabsTrigger>
        )}
        {friendSuccess && friendPrayerRequests.length > 0 && (
          <TabsTrigger value="community" variant="underline">
            Community
          </TabsTrigger>
        )}
        {inProgressSuccess && inProgressPrayerRequests.length > 0 && (
          <TabsTrigger value="personal" variant="underline">
            Personal
          </TabsTrigger>
        )}
      </TabsList>

      <div
        className={
          isStandAlone
            ? "overflow-y-auto max-h-[calc(100vh_-_36px_-40px_-_82px)] pb-6"
            : "overflow-y-auto max-h-[calc(100vh_-_36px_-40px)] pb-6"
        }
      >
        <PullToRefreshWrapper include>
          <TabsContent value="all">
            {friendSuccess && friendPrayerRequests.length > 0 && (
              <div>
                {friendPrayerRequests.map((prayer) => (
                  <PrayerRequestCard
                    key={prayer.id}
                    user={prayer.user}
                    prayer={prayer}
                    isOwner={false}
                    currUserName={user.name}
                  />
                ))}
              </div>
            )}
            {inProgressSuccess && inProgressPrayerRequests.length > 0 && (
              <div>
                {inProgressPrayerRequests.map((prayer) => (
                  <PrayerRequestCard
                    key={prayer.id}
                    user={user}
                    prayer={prayer}
                    isOwner={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="community">
            {friendSuccess && friendPrayerRequests.length > 0 && (
              <div>
                {friendPrayerRequests.map((prayer) => (
                  <PrayerRequestCard
                    key={prayer.id}
                    user={prayer.user}
                    prayer={prayer}
                    isOwner={false}
                    currUserName={user.name}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="personal">
            {inProgressSuccess && inProgressPrayerRequests.length > 0 && (
              <div>
                {inProgressPrayerRequests.map((prayer) => (
                  <PrayerRequestCard
                    key={prayer.id}
                    user={user}
                    prayer={prayer}
                    isOwner={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </PullToRefreshWrapper>
      </div>
    </Tabs>
  );
};
