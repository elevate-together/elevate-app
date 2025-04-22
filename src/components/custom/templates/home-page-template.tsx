"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PrayerRequestCard from "@/components/custom/prayer-request/prayer-request-card";
import { PullToRefreshWrapper } from "@/components/custom/functions/pull-to-refresh-wrapper";
import { PrayerRequestWithUser } from "@/lib/utils";
import { User } from "@prisma/client";

interface HomeClientTemplateProps {
  user: User;
  friendPrayerRequests: PrayerRequestWithUser[];
  inProgressPrayerRequests: PrayerRequestWithUser[];
  allPrayerRequests: PrayerRequestWithUser[];
}

export const HomPagetemplate = ({
  user,
  friendPrayerRequests,
  inProgressPrayerRequests,
  allPrayerRequests,
}: HomeClientTemplateProps) => {
  return (
    <Tabs defaultValue="all">
      <TabsList variant="fullWidth">
        <TabsTrigger value="all" variant="underline">
          All
        </TabsTrigger>
        <TabsTrigger value="community" variant="underline">
          Community
        </TabsTrigger>
        <TabsTrigger value="personal" variant="underline">
          Personal
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-y-auto max-h-[calc(100vh_-_40px_-_44px_-_82px)] md:max-h-[calc(100vh_-_40px)]">
        <PullToRefreshWrapper>
          <TabsContent value="all">
            {allPrayerRequests.length > 0 && (
              <div>
                {allPrayerRequests.map((prayer) => (
                  <PrayerRequestCard
                    key={prayer.id}
                    user={prayer.user}
                    prayer={prayer}
                    isOwner={user.id === prayer.user.id}
                    currUserName={user.name}
                    hideActions
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="community">
            {friendPrayerRequests.length > 0 && (
              <div>
                {friendPrayerRequests.map((prayer) => (
                  <PrayerRequestCard
                    key={prayer.id}
                    user={prayer.user}
                    prayer={prayer}
                    isOwner={user.id === prayer.user.id}
                    currUserName={user.name}
                    hideActions
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="personal">
            {inProgressPrayerRequests.length > 0 && (
              <div>
                {inProgressPrayerRequests.map((prayer) => (
                  <PrayerRequestCard
                    key={prayer.id}
                    user={prayer.user}
                    prayer={prayer}
                    isOwner={user.id === prayer.user.id}
                    hideActions
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
