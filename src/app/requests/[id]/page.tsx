import PrayerRequestTemplate from "@/components/custom/prayer-request/prayer-request-template";
import { getUserById } from "@/services/users";

export default async function UserRequests({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { user } = await getUserById(id);

  if (!user) {
    return <div className="p-2">Unable to Find User</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PrayerRequestTemplate id={id} user={user} />
    </div>
  );
}
