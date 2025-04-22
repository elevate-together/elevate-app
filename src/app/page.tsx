"use server";

import { auth } from "@/auth";
import { getInProgressPrayerRequestsForUser } from "@/services/prayer-request";
import { getPrayerRequestsSharedWithUser } from "@/services/prayer-request-share";
import { getUserById } from "@/services/users";
import WelcomePage from "@/components/custom/templates/welcome-page";
import { HomPagetemplate } from "@/components/custom/templates/home-page-template";

export default async function Home() {
  const session = await auth();

  if (!session || !session.user) {
    return (
      <div className="h-80vh">
        <WelcomePage />
      </div>
    );
  }

  const id = session?.user.id;

  if (!id) {
    return <div>Error loading user data</div>;
  }

  const { user } = await getUserById(id);

  if (!user) {
    return <div>Error loading user data</div>;
  }

  // Fetching Prayer Requests
  const { success: FriendSuccess, prayerRequests: FriendPrayerRequests } =
    await getPrayerRequestsSharedWithUser(id, false);

  const {
    success: InProgressSuccess,
    prayerRequests: InProgressPrayerRequests,
  } = await getInProgressPrayerRequestsForUser(id);

  if (!FriendSuccess || !InProgressSuccess) {
    return <div>Error loading prayer requests. Please try again later.</div>;
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
    <HomPagetemplate
      user={user}
      friendPrayerRequests={FriendPrayerRequests ?? []}
      inProgressPrayerRequests={InProgressPrayerRequests ?? []}
      allPrayerRequests={allPrayerRequests ?? []}
    />
  );
}
