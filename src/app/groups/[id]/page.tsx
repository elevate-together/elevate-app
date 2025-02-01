import PrayerGroupMemberTable from "@/components/custom/prayer-group/prayer-group-member-table";
import { Separator } from "@/components/ui/separator";
import { getPrayerGroupById } from "@/services/prayer-group";
import { getUsersByPrayerGroup } from "@/services/user-prayer-group";

export default async function Group({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { prayerGroup } = await getPrayerGroupById(id);
  const { users } = await getUsersByPrayerGroup(id);

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
      {users && <PrayerGroupMemberTable data={users} />}
    </div>
  );
}
