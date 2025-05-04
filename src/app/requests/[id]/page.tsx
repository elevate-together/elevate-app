import { auth } from "@/auth";
import PrayerRequestGuestPageTemplate from "@/components/custom/templates/prayer-request-guest-page-template";
import PrayerRequestUserPageTemplate from "@/components/custom/templates/prayer-request-user-page-template";
import SessionNotFound from "@/components/not-found/session";
import UserNotFound from "@/components/not-found/user";
import {
  getPrayerRequestsByUserId,
  getUserPrayerRequestsVisibleUser,
} from "@/services/prayer-request";
import { getUserById } from "@/services/user";

export default async function UserRequests({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return <SessionNotFound />;
  }
  const sessionUserId = session.user.id;
  const { id: pageUserId } = await params;

  const isOwner = sessionUserId === pageUserId;
  if (isOwner) {
    const { prayerRequests } = await getPrayerRequestsByUserId(pageUserId);
    const { user: currUser } = await getUserById({ id: sessionUserId });

    if (!currUser) {
      return <UserNotFound />;
    }

    return (
      <PrayerRequestUserPageTemplate
        currUser={currUser}
        prayerRequests={prayerRequests ?? []}
      />
    );
  }

  const { user: pageUser } = await getUserById({ id: pageUserId });
  const { prayerRequests } = await getUserPrayerRequestsVisibleUser(
    pageUserId,
    sessionUserId
  );

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
