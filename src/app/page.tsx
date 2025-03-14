import { auth } from "@/auth";
import PrayerRequestCard from "@/components/custom/prayer-request/prayer-request-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInProgressPrayerRequestsByUserId } from "@/services/prayer-request";
import { getFriendPrayerRequestsForUser, getUserById } from "@/services/users";

export default async function Home() {
  const session = await auth();

  // User is not signed in
  if (!session || !session.user) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Welcome to Elevate</h1>
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
          <h1 className="text-md font-semibold mb-3">How You Can Pray Today</h1>
          <Tabs defaultValue="community" className="w-full">
            <TabsList>
              {FriendSuccess &&
                FriendPrayerRequests &&
                FriendPrayerRequests?.length > 0 && (
                  <TabsTrigger value="community">Community</TabsTrigger>
                )}
              {InProgressSuccess &&
                InProgressPrayerRequests &&
                InProgressPrayerRequests.length > 0 && (
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                )}
            </TabsList>
            <TabsContent value="community">
              {FriendSuccess &&
                FriendPrayerRequests &&
                FriendPrayerRequests?.length > 0 && (
                  <div>
                    {FriendPrayerRequests.map((prayer) => (
                      <PrayerRequestCard
                        key={prayer.id}
                        user={prayer.user}
                        prayer={prayer}
                        isOwner={false}
                        currUserName={user.name}
                        displayName
                      />
                    ))}
                  </div>
                )}
            </TabsContent>
            <TabsContent value="personal">
              {InProgressSuccess &&
                InProgressPrayerRequests &&
                InProgressPrayerRequests.length > 0 && (
                  <div>
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
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="space-y-3">
          <h1 className="text-2xl font-bold">Welcome to Elevate</h1>
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
