"use server";

import { auth } from "@/auth";
import { getInProgressPrayerRequestsForUser } from "@/services/prayer-request";
import { getPrayerRequestsSharedWithUser } from "@/services/prayer-request-share";
import { getUserById } from "@/services/users";
import WelcomePage from "@/components/custom/templates/welcome-page";
import { HomePagetemplate } from "@/components/custom/templates/home-page-template";
import UserNotFound from "@/components/not-found/user";
import PrayerRequestNotFound from "@/components/not-found/prayer-request";

export default async function Home() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return (
      <div className="h-80vh">
        <WelcomePage />
      </div>
    );
  }

  const id = session.user.id;

  const { user } = await getUserById(id);

  if (!user) {
    return <UserNotFound />;
  }

  const { success: FriendSuccess, prayerRequests: FriendPrayerRequests } =
    await getPrayerRequestsSharedWithUser(id, false);

  const {
    success: InProgressSuccess,
    prayerRequests: InProgressPrayerRequests,
  } = await getInProgressPrayerRequestsForUser(id);

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
      user={user}
      friendPrayerRequests={FriendPrayerRequests ?? []}
      inProgressPrayerRequests={InProgressPrayerRequests ?? []}
      allPrayerRequests={allPrayerRequests ?? []}
    />
  );
}
