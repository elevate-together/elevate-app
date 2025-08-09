import { auth } from "@/auth";
import {
  PrayerRequestGuestPageTemplate,
  PrayerRequestUserPageTemplate,
  SessionNotFound,
  UserNotFound,
} from "@/components/common";
import {
  getAllPrayerRequestsByUserId,
  getUserPrayerRequestsVisibleUser,
} from "@/services/prayer-request";
import { getUserById } from "@/services/user";

export default async function UserRequests({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id: pageUserId } = await params;

  if (!session) {
    return <SessionNotFound />;
  }
  const isOwner = session.user.id === pageUserId;

  if (!isOwner) {
    const { user: pageUser } = await getUserById({ id: pageUserId });
    const { prayerRequests } = await getUserPrayerRequestsVisibleUser({
      userId: pageUserId,
      guestUserId: session.user.id,
    });

    if (!pageUser) {
      return <UserNotFound />;
    }

    return (
      <PrayerRequestGuestPageTemplate
        user={pageUser}
        prayerRequests={prayerRequests ?? []}
      />
    );
  }

  const { prayerRequests } = await getAllPrayerRequestsByUserId({
    userId: pageUserId,
  });

  return (
    <PrayerRequestUserPageTemplate
      currUser={session.user}
      prayerRequests={prayerRequests ?? []}
    />
  );
}
