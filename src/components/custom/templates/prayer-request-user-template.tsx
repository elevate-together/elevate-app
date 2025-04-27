"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PrayerRequestCard from "../prayer-request/prayer-request-card";
import { PrayerRequest, PrayerRequestStatus, User } from "@prisma/client";
import { Hand, Package, Star } from "lucide-react";
import { PullToRefreshWrapper } from "../functions/pull-to-refresh-wrapper";
import NoDataDisplay from "./no-data-display";
import PageHeightDiv from "./page-height-div";

type PrayerRequestUserTemplateProps = {
  currUser: User;
  prayerRequests: PrayerRequest[];
};

export default function PrayerRequestUserTemplate({
  currUser,
  prayerRequests,
}: PrayerRequestUserTemplateProps) {
  const [activeTab, setActiveTab] = useState<string>("request");

  const inProgressRequests = useMemo(
    () =>
      prayerRequests.filter(
        (r) => r.status === PrayerRequestStatus.IN_PROGRESS
      ),
    [prayerRequests]
  );

  const answeredRequests = useMemo(
    () =>
      prayerRequests.filter((r) => r.status === PrayerRequestStatus.ANSWERED),
    [prayerRequests]
  );

  const archivedRequests = useMemo(
    () =>
      prayerRequests.filter((r) => r.status === PrayerRequestStatus.ARCHIVED),
    [prayerRequests]
  );

  const renderPrayerRequests = (requests: PrayerRequest[]) => (
    <PullToRefreshWrapper>
      {requests.map((prayer) => (
        <PrayerRequestCard
          key={prayer.id}
          user={currUser}
          prayer={prayer}
          isOwner
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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList variant="fullWidth">
        <TabsTrigger value="request" variant="underline">
          <Hand size="15px" className="mr-1" /> Requested
        </TabsTrigger>
        <TabsTrigger value="answered" variant="underline">
          <Star size="15px" className="mr-1" /> Answered
        </TabsTrigger>
        <TabsTrigger value="past" variant="underline">
          <Package size="15px" className="mr-1" /> Archived
        </TabsTrigger>
      </TabsList>
      <PageHeightDiv addTabs>
        <TabsContent
          value="request"
          className={`${
            activeTab === "request" && !inProgressRequests.length
              ? "flex flex-1 justify-center items-center h-full w-full"
              : ""
          }`}
        >
          {inProgressRequests.length
            ? renderPrayerRequests(inProgressRequests)
            : renderNoData(
                "No active prayer requests!",
                "You have no prayer requests that are actively being prayed for. Consider adding a request so others can join in prayer with you!",
                Hand
              )}
        </TabsContent>
        <TabsContent
          value="answered"
          className={`${
            activeTab === "answered" && !answeredRequests.length
              ? "flex flex-1 justify-center items-center h-full w-full"
              : ""
          }`}
        >
          {answeredRequests.length
            ? renderPrayerRequests(answeredRequests)
            : renderNoData(
                "No answered prayer requests yet!",
                "You have no answered requests at the moment. Keep praying, the Lord is faithful. Remember Matthew 7:11!",
                Star
              )}
        </TabsContent>
        <TabsContent
          value="past"
          className={`${
            activeTab === "past" && !archivedRequests.length
              ? "flex flex-1 justify-center items-center h-full w-full"
              : ""
          }`}
        >
          {archivedRequests.length
            ? renderPrayerRequests(archivedRequests)
            : renderNoData(
                "No archived prayer requests yet!",
                "You don't have any archived prayer requests at the moment. Archived requests are those that are no longer active or in progress.",
                Package
              )}
        </TabsContent>
      </PageHeightDiv>
    </Tabs>
  );
}
