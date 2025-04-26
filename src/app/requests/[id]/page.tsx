import { auth } from "@/auth";
import PrayerRequestGuestTemplate from "@/components/custom/templates/prayer-request-guest-template";
import PrayerRequestUserTemplate from "@/components/custom/templates/prayer-request-user-template";
import {
  getInProgressPrayerRequestsForUser,
  getPrayerRequestsByUserId,
} from "@/services/prayer-request";
import { getUserById } from "@/services/users";

export default async function UserRequests({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return <div className="p-2">Unable to Find User</div>;
  }
  const currUserId = session.user.id;
  const { id: pageUserId } = await params;

  const isOwner = currUserId === pageUserId;
  if (isOwner) {
    const { prayerRequests } = await getPrayerRequestsByUserId(pageUserId);
    const { user: currUser } = await getUserById(currUserId);

    if (!currUser) {
      return <div className="p-2">Unable to Find User</div>;
    }

    return (
      <PrayerRequestUserTemplate
        currUser={currUser}
        prayerRequests={prayerRequests ?? []}
      />
    );
  }

  const { user: pageUser } = await getUserById(pageUserId);
  const { prayerRequests } = await getInProgressPrayerRequestsForUser(
    pageUserId
  );

  if (!pageUser) {
    return <div className="p-2">Unable to Find User</div>;
  }

  return (
    <PrayerRequestGuestTemplate
      user={pageUser}
      prayerRequests={prayerRequests ?? []}
    />
  );
}
