import UserAvatar from "@/components/custom/user/user-avatar";
import { getPrayerGroupById } from "@/services/prayer-group";
import { getUsersInPrayerGroup } from "@/services/user-prayer-group";

export default async function Group({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { prayerGroup } = await getPrayerGroupById(id);

  console.log("HELLO", prayerGroup);

  if (!prayerGroup) {
    return null;
  }

  const { users } = await getUsersInPrayerGroup(prayerGroup.id);

  return (
    <div>
      <div className="flex flex-row justify-between gap-1">
        <h2 className="text-xl font-bold">{prayerGroup.name}</h2>

        <div className="flex flex-row items-center gap-1">
          <div className="text-sm ">Owner:</div>

          <UserAvatar
            name={prayerGroup.owner?.name}
            email={prayerGroup.owner?.email}
            image={prayerGroup.owner?.image ?? undefined}
            includeEmail={false}
            size="small"
          />
        </div>
      </div>

      <ul>
        {users &&
          users.map((user) => (
            <li key={user.id}>
              {user.name} ({user.email})
            </li>
          ))}
      </ul>
    </div>
  );
}
