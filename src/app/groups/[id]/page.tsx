import PrayerGroupMemberTable from "@/components/custom/prayer-group/prayer-group-member-table";
import PrayerRequestCard from "@/components/custom/prayer-request/prayer-request-card";
import { Separator } from "@/components/ui/separator";
import {
  getInProgressPrayerRequestsByGroupId,
  getPrayerGroupById,
} from "@/services/prayer-group";
import { getUsersByPrayerGroup } from "@/services/user-prayer-group";

export default async function Group({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { prayerGroup } = await getPrayerGroupById(id);
  const { users } = await getUsersByPrayerGroup(id);

  const { prayerRequests: inProgressRequests } =
    await getInProgressPrayerRequestsByGroupId(id);

  console.log(inProgressRequests);

  if (!prayerGroup) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold">{prayerGroup.name}</h1>
        <h2 className="text-sm ">{prayerGroup.description}</h2>
      </div>
      <Separator />
      <div className="text-base font-bold">Current Prayer Requests</div>
      {inProgressRequests ? (
        <div>
          <div className="flex flex-col gap-3">
            {inProgressRequests.map((prayer) => (
              <PrayerRequestCard
                key={prayer.id}
                user={prayer.user}
                prayer={prayer}
                isOwner={false}
                displayName
              />
            ))}
          </div>
        </div>
      ) : (
        <div>{`${prayerGroup.name} doesn't have any prayer requests right now.`}</div>
      )}
      <Separator />
      {users && <PrayerGroupMemberTable data={users} />}
    </div>
  );
}
