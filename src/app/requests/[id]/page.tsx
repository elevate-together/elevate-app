import { auth } from "@/auth";
import PrayerRequestTemplate from "@/components/custom/prayer-request/prayer-request-template";
import { getUserById } from "@/services/users";

export default async function UserRequests({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: pageId } = await params;

  const session = await auth();

  if (!session || !session.user || !session.user?.id) {
    return <div className="p-2">Unable to Find User</div>;
  }

  const currId = session.user.id;

  const { user: currUser } = await getUserById(currId);

  const { user: pageUser } = await getUserById(pageId);

  if (!currUser || !pageUser) {
    return <div className="p-2">Unable to Find User</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PrayerRequestTemplate currUser={currUser} pageUser={pageUser} />
    </div>
  );
}
