import { getPrayerRequestsByUserId } from "@/services/prayer-request";
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

  const { prayerRequests } = await getPrayerRequestsByUserId(id);

  console.log(prayerRequests);

  return (
    <div className="flex flex-col gap-6">
      {prayerRequests && (
        <div>
          <h1>Prayer Requests</h1>
          <div>
            {prayerRequests.map((request) => (
              <div key={request.id}>
                <h3>{request.request}</h3>
                <p>Status: {request.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
