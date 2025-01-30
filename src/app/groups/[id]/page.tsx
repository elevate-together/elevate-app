import PrayerGroupMembers from "@/components/custom/prayer-group/prayer-group-members";
import { Separator } from "@/components/ui/separator";
import { getPrayerGroupById } from "@/services/prayer-group";

export default async function Group({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { prayerGroup } = await getPrayerGroupById(id);

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
      <div>
        <div className="text-md font-bold pb-2">All Members</div>
        <PrayerGroupMembers id={prayerGroup.id} />
      </div>
    </div>
  );
}
