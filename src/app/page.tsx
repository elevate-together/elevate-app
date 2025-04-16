// "use server" directive for server-side page
"use server";

import { auth } from "@/auth";
import { getPersonalPrayerRequestsForUser } from "@/services/prayer-request";
import { getPrayerRequestsSharedWithUser } from "@/services/prayer-request-share";
import { getUserById } from "@/services/users";
import WelcomePage from "@/components/custom/templates/welcome-page";
import { HomPagetemplate } from "@/components/custom/templates/home-page-template";

export default async function Home() {
  const session = await auth();

  // User is not signed in
  if (!session || !session.user) {
    return (
      <div className="h-80vh">
        <WelcomePage />
      </div>
    );
  }

  // Getting current user info
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
    await getPrayerRequestsSharedWithUser(id);

  const {
    success: InProgressSuccess,
    prayerRequests: InProgressPrayerRequests,
  } = await getPersonalPrayerRequestsForUser(id);

  return (
    <HomPagetemplate
      user={user}
      friendPrayerRequests={FriendPrayerRequests ?? []}
      inProgressPrayerRequests={InProgressPrayerRequests ?? []}
      friendSuccess={FriendSuccess}
      inProgressSuccess={InProgressSuccess}
    />
  );
}
