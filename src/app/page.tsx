import { auth } from "@/auth";
import PrayerRequestCard from "@/components/custom/prayer-request/prayer-request-card";
import WelcomePage from "@/components/custom/templates/welcome-page/welcome-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPersonalPrayerRequestsForUser } from "@/services/prayer-request";
import { getPrayerRequestsSharedWithUser } from "@/services/prayer-request-share";
import { getUserById } from "@/services/users";

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

  const { success: FriendSuccess, prayerRequests: FriendPrayerRequests } =
    await getPrayerRequestsSharedWithUser(id);

  const {
    success: InProgressSuccess,
    prayerRequests: InProgressPrayerRequests,
  } = await getPersonalPrayerRequestsForUser(id);

  return (
    <div className="md:ml-5 h-full w-full">
      <div className="space-y-5">
        <Tabs defaultValue="community" className="w-full ">
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
    </div>
  );
}
