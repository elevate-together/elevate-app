"use client";

import { PrayerRequest } from "@prisma/client";
import { UserIcon } from "lucide-react";
import { PrayerRequestWithUser } from "@/lib/utils";
import { PrayerRequestCard } from "@/components/data-handlers";
import {
  IconName,
  NoDataDisplay,
  PullToRefreshWrapper,
} from "@/components/common";
import { Button } from "@/components/ui";
import { Session } from "next-auth";

type PrayerRequestGuestPageTemplateProps = {
  user: Session["user"];
  prayerRequests: PrayerRequestWithUser[];
};

export function PrayerRequestGuestPageTemplate({
  user,
  prayerRequests,
}: PrayerRequestGuestPageTemplateProps) {
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

  const renderNoData = (title: string, subtitle: string, icon: IconName) => (
    <NoDataDisplay title={title} subtitle={subtitle} icon={icon} />
  );

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
            "HelpingHand"
          )}
    </div>
  );
}
