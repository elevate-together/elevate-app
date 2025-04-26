"use client";

import PrayerRequestCard from "../prayer-request/prayer-request-card";
import { PrayerRequest, User } from "@prisma/client";
import { HelpingHand, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PullToRefreshWrapper } from "../functions/pull-to-refresh-wrapper";
import NoDataDisplay from "./no-data-display";
import { PrayerRequestWithUser } from "@/lib/utils";

type PrayerRequestGuestTemplateProps = {
  user: User;
  prayerRequests: PrayerRequestWithUser[];
};

export default function PrayerRequestGuestTemplate({
  user,
  prayerRequests,
}: PrayerRequestGuestTemplateProps) {
  const renderPrayerRequests = (requests: PrayerRequest[]) => (
    <PullToRefreshWrapper>
      {requests.map((prayer) => (
        <PrayerRequestCard
          key={prayer.id}
          user={user}
          prayer={prayer}
          isOwner={false}
        />
      ))}
    </PullToRefreshWrapper>
  );

  const renderNoData = (
    title: string,
    subtitle: string,
    icon: React.ElementType
  ) => <NoDataDisplay title={title} subtitle={subtitle} icon={icon} />;

  return (
    <div
      className={`${
        !prayerRequests.length
          ? "flex flex-1 flex-col justify-center items-center h-full w-full"
          : ""
      }`}
    >
      <div className="flex flex-row justify-between items-center p-2 px-4 w-full">
        <h1 className="text-lg font-bold ">{`Prayer Requests for ${user.name}`}</h1>
        <Button variant="secondary" size="icon">
          <UserIcon />
        </Button>
      </div>
      {prayerRequests.length
        ? renderPrayerRequests(prayerRequests)
        : renderNoData(
            `${user.name} has no prayer requests yet!`,
            `${user.name} doesn't have any requests right now, but you can still lift them up in prayer. Maybe ask how you can pray for them.`,
            HelpingHand
          )}
    </div>
  );
}
