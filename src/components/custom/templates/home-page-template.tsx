"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PrayerRequestCard from "@/components/custom/prayer-request/prayer-request-card";
import { PullToRefreshWrapper } from "@/components/custom/templates/helper/pull-to-refresh-wrapper";
import { PrayerRequestWithUser } from "@/lib/utils";
import { User } from "@prisma/client";
import PageHeightDiv from "@/components/custom/templates/helper/page-height-div";
import NoDataDisplay from "@/components/custom/templates/helper/no-data-display";
import { useState } from "react";
import { HelpingHand } from "lucide-react";

interface HomeClientTemplateProps {
  user: User;
  friendPrayerRequests: PrayerRequestWithUser[];
  inProgressPrayerRequests: PrayerRequestWithUser[];
  allPrayerRequests: PrayerRequestWithUser[];
}

export const HomePagetemplate = ({
  user,
  friendPrayerRequests,
  inProgressPrayerRequests,
  allPrayerRequests,
}: HomeClientTemplateProps) => {
  const [activeTab, setActiveTab] = useState<string>("all");

  const renderPrayerRequests = (requests: PrayerRequestWithUser[]) => (
    <PullToRefreshWrapper>
      {requests.map((prayer) => (
        <PrayerRequestCard
          key={prayer.id}
          user={prayer.user}
          prayer={prayer}
          isOwner={user.id === prayer.user.id}
          currUserName={user.name}
          hideActions
        />
      ))}
    </PullToRefreshWrapper>
  );

  const renderNoData = (
    title: string,
    subtitle: string,
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  ) => <NoDataDisplay title={title} subtitle={subtitle} icon={icon} />;

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
      defaultValue="all"
    >
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
      <PageHeightDiv addTabs>
        <TabsContent
          value="all"
          className={`${
            activeTab === "all" && !allPrayerRequests.length
              ? "flex flex-1 justify-center items-center h-full w-full"
              : ""
          }`}
        >
          {allPrayerRequests.length
            ? renderPrayerRequests(allPrayerRequests)
            : renderNoData(
                "No active prayer requests!",
                "There are no current prayer requests. Consider reaching out to others to see how you can pray for them, and feel free to add your own requests so the community can pray for you!",
                HelpingHand
              )}
        </TabsContent>

        <TabsContent
          value="community"
          className={`${
            activeTab === "community" && !friendPrayerRequests.length
              ? "flex flex-1 justify-center items-center h-full w-full"
              : ""
          }`}
        >
          {friendPrayerRequests.length
            ? renderPrayerRequests(friendPrayerRequests)
            : renderNoData(
                "No active prayer requests!",
                "Your community doesn't have any current prayer requests. Consider asking how you can pray for others!",
                HelpingHand
              )}
        </TabsContent>

        <TabsContent
          value="personal"
          className={`${
            activeTab === "personal" && !inProgressPrayerRequests.length
              ? "flex flex-1 justify-center items-center h-full w-full"
              : ""
          }`}
        >
          {inProgressPrayerRequests.length
            ? renderPrayerRequests(inProgressPrayerRequests)
            : renderNoData(
                "No active prayer requests!",
                "You have no prayer requests that are actively being prayed for. Consider adding a request so others can join in prayer with you!",
                HelpingHand
              )}
        </TabsContent>
      </PageHeightDiv>
    </Tabs>
  );
};
