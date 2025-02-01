import { auth } from "@/auth";
import PrayerRequestCard from "@/components/custom/prayer-request/prayer-request-card";
import { Separator } from "@/components/ui/separator";
import { getInProgressPrayerRequestsByUserId } from "@/services/prayer-request";
import { getFriendPrayerRequestsForUser, getUserById } from "@/services/users";

export default async function Home() {
  const session = await auth();

  // User is not signed in
  if (!session || !session.user) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-bold">Welcome to Elevate</h1>
        <p>
          At Elevate Together, our mission is to foster deeper connections
          within communities by enhancing the power of prayer. We believe that
          prayer is a transformative force that brings people together, and we
          are committed to making prayer more accessible, intentional, and
          impactful. Through innovative prayer request tracking and real-time
          notifications, we empower individuals and groups to support one
          another in prayer, ensuring no prayer goes unnoticed and no request is
          forgotten. Together, we elevate our communities, strengthen our faith,
          and inspire collective growth in every moment of prayer.
        </p>
      </div>
    );
  }

  // Getting current user info
  const id = session?.user.id;

  if (!id) {
    return <div>Error loading user data</div>;
  }

  const { user } = await getUserById(id);

  const { success: FriendSuccess, prayerRequests: FriendPrayerRequests } =
    await getFriendPrayerRequestsForUser(id);

  const {
    success: InProgressSuccess,
    prayerRequests: InProgressPrayerRequests,
  } = await getInProgressPrayerRequestsByUserId(id);

  return (
    <div className="ml-2">
      {user ? (
        <div className="space-y-5">
          <h1 className="text-xl font-bold">{`Welcome ${user.name}`}</h1>

          {FriendSuccess &&
            FriendPrayerRequests &&
            FriendPrayerRequests?.length > 0 && (
              <div>
                <h1 className="text-md font-bold mb-3">
                  Ways You Can Pray For Others Today
                </h1>
                {FriendPrayerRequests.map((prayer) => (
                  <PrayerRequestCard
                    key={prayer.id}
                    user={user}
                    prayer={prayer}
                    isOwner={false}
                    displayName
                  />
                ))}
              </div>
            )}
          <Separator />

          {InProgressSuccess &&
            InProgressPrayerRequests &&
            InProgressPrayerRequests.length > 0 && (
              <div>
                <h1 className="text-md font-bold mb-3">Your Prayer Requests</h1>
                {InProgressPrayerRequests.map((prayer) => (
                  <PrayerRequestCard
                    key={prayer.id}
                    user={user}
                    prayer={prayer}
                    isOwner={true}
                  />
                ))}
              </div>
            )}
        </div>
      ) : (
        <div className="space-y-3">
          <h1 className="text-xl font-bold">Welcome to Elevate</h1>
          <p>
            At Elevate Together, our mission is to foster deeper connections
            within communities by enhancing the power of prayer. We believe that
            prayer is a transformative force that brings people together, and we
            are committed to making prayer more accessible, intentional, and
            impactful. Through innovative prayer request tracking and real-time
            notifications, we empower individuals and groups to support one
            another in prayer, ensuring no prayer goes unnoticed and no request
            is forgotten. Together, we elevate our communities, strengthen our
            faith, and inspire collective growth in every moment of prayer.
          </p>
        </div>
      )}
    </div>
  );
}
