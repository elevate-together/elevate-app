import { auth } from "@/auth";
import PrayerRequestTemplate from "@/components/custom/templates/prayer-request-template";
import { getPrayerRequestsByUserId } from "@/services/prayer-request";
import { getUserById } from "@/services/users";

export default async function UserRequests({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id: pageUserId } = await params;

  if (!session?.user?.id) {
    return <div className="p-2">Unable to Find User</div>;
  }

  const currUserId = session.user.id;

  const { user: currUser } = await getUserById(currUserId);
  const { user: pageUser } = await getUserById(pageUserId);
  const { prayerRequests } = await getPrayerRequestsByUserId(pageUserId);

  if (!currUser || !pageUser) {
    return <div className="p-2">Unable to Find User</div>;
  }

  const isOwner = currUser.id === pageUser.id;

  return (
    <PrayerRequestTemplate
      currUser={currUser}
      pageUser={pageUser}
      prayerRequests={prayerRequests ?? []}
      isOwner={isOwner}
    />
  );
}
