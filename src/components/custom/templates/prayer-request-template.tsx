"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PrayerRequestCard from "../prayer-request/prayer-request-card";
import { PrayerRequest, PrayerRequestStatus, User } from "@prisma/client";
import { Hand, Package, Star, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PullToRefreshWrapper } from "../functions/pull-to-refresh-wrapper";

type Props = {
  currUser: User;
  pageUser: User;
  prayerRequests: PrayerRequest[];
  isOwner: boolean;
};

export default function PrayerRequestTemplate({
  currUser,
  pageUser,
  prayerRequests,
  isOwner,
}: Props) {
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
  if (isOwner) {
    return (
      <Tabs defaultValue="request" className="w-full">
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

        <div className="flex-1 overflow-y-auto max-h-[calc(100vh_-_40px_-_44px_-_82px)] md:max-h-[calc(100vh_-_44px)]">
          <PullToRefreshWrapper>
            <TabsContent value="request">
              {inProgressRequests.length ? (
                inProgressRequests.map((prayer) => (
                  <PrayerRequestCard
                    key={prayer.id}
                    user={currUser}
                    prayer={prayer}
                    isOwner
                  />
                ))
              ) : (
                <div className="px-3">You have no active prayer requests.</div>
              )}
            </TabsContent>
            <TabsContent value="answered">
              {answeredRequests.length ? (
                answeredRequests.map((prayer) => (
                  <PrayerRequestCard
                    key={prayer.id}
                    user={currUser}
                    prayer={prayer}
                    isOwner
                  />
                ))
              ) : (
                <div className="px-3">
                  You have no answered prayer requests.
                </div>
              )}
            </TabsContent>
            <TabsContent value="past">
              {archivedRequests.length ? (
                archivedRequests.map((prayer) => (
                  <PrayerRequestCard
                    key={prayer.id}
                    user={currUser}
                    prayer={prayer}
                    isOwner
                  />
                ))
              ) : (
                <div className="px-3">
                  You have no archived prayer requests.
                </div>
              )}
            </TabsContent>
          </PullToRefreshWrapper>
        </div>
      </Tabs>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-xl font-bold">{`${pageUser.name}'s Prayer Requests`}</h1>
        <Button variant="outline" size="icon">
          <UserIcon />
        </Button>
      </div>
      <Separator />
      {inProgressRequests.length ? (
        inProgressRequests.map((prayer) => (
          <PrayerRequestCard
            key={prayer.id}
            user={pageUser}
            prayer={prayer}
            isOwner={false}
          />
        ))
      ) : (
        <div>{`${pageUser.name} doesn't have any prayer requests right now.`}</div>
      )}
    </div>
  );
}
