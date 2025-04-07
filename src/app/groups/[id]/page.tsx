"use server";

import PrayerGroupMemberTable from "@/components/custom/prayer-group/prayer-group-member-table";
import PrayerRequestCard from "@/components/custom/prayer-request/prayer-request-card";
import { Separator } from "@/components/ui/separator";
import { getPrayerGroupById } from "@/services/prayer-group";
import { getUsersByPrayerGroup } from "@/services/user-prayer-group";
import { auth } from "@/auth";
import { getUserById } from "@/services/users";
import { getPrayerRequestsForGroup } from "@/services/prayer-request-share";
import { getPublicPrayerRequestsForGroup } from "@/services/prayer-request-share";

export default async function Group({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { prayerGroup } = await getPrayerGroupById(id);
  const { users } = await getUsersByPrayerGroup(id);
  const { data: SharedWithGroupReq } = await getPrayerRequestsForGroup(id);

  const session = await auth();

  // User is not signed in
  if (!session || !session.user) {
    return null;
  }

  // Getting current user info
  const userId = session?.user.id;

  if (!userId) {
    return <div>Error loading user data</div>;
  }

  const { user: currUser } = await getUserById(userId);

  const { data: inProgressRequests } = await getPublicPrayerRequestsForGroup(
    id
  );

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
      <div className="text-base font-bold">
        Prayer Requests Shared With This Group:{" "}
      </div>
      {SharedWithGroupReq ? (
        <div>
          <div className="flex flex-col gap-3">
            {SharedWithGroupReq.map((prayer) => (
              <PrayerRequestCard
                key={prayer.prayerRequest.id}
                user={prayer.user}
                prayer={prayer.prayerRequest}
                isOwner={false}
                currUserName={currUser?.name ?? ""}
              />
            ))}
          </div>
        </div>
      ) : (
        <div>{`${prayerGroup.name} doesn't have any prayer requests right now.`}</div>
      )}
      <Separator />
      <div className="text-base font-bold">Other Prayer Requests</div>
      {inProgressRequests ? (
        <div>
          <div className="flex flex-col gap-3">
            {inProgressRequests.map((prayer) => (
              <PrayerRequestCard
                key={prayer.prayerRequest.id}
                user={prayer.user}
                prayer={prayer.prayerRequest}
                isOwner={false}
                currUserName={currUser?.name ?? ""}
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
