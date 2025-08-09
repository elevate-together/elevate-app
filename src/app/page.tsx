"use server";

import { auth } from "@/auth";
import { getInProgressPrayerRequestsForUser } from "@/services/prayer-request";
import { getPrayerRequestsSharedWithUser } from "@/services/prayer-request-share";

import {
  HomePagetemplate,
  PrayerRequestNotFound,
  WelcomePageTemplate,
} from "@/components/common";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return (
      <div className="h-80vh">
        <WelcomePageTemplate />
      </div>
    );
  }

  const { success: FriendSuccess, prayerRequests: FriendPrayerRequests } =
    await getPrayerRequestsSharedWithUser(session.user.id, false);

  const {
    success: InProgressSuccess,
    prayerRequests: InProgressPrayerRequests,
  } = await getInProgressPrayerRequestsForUser({ userId: session.user.id });

  if (!FriendSuccess || !InProgressSuccess) {
    return <PrayerRequestNotFound />;
  }

  const combinedPrayerRequests = [
    ...(FriendPrayerRequests ?? []),
    ...(InProgressPrayerRequests ?? []),
  ];

  const uniqueCombinedPrayerRequests = combinedPrayerRequests.filter(
    (request, index, self) =>
      index === self.findIndex((r) => r.id === request.id)
  );

  const allPrayerRequests = uniqueCombinedPrayerRequests.sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );

  return (
    <HomePagetemplate
      user={session.user}
      friendPrayerRequests={FriendPrayerRequests ?? []}
      inProgressPrayerRequests={InProgressPrayerRequests ?? []}
      allPrayerRequests={allPrayerRequests ?? []}
    />
  );
}
