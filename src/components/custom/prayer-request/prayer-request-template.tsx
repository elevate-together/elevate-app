import PrayerRequestCard from "@/components/custom/prayer-request/prayer-request-card";
import { Separator } from "@/components/ui/separator";
import { getPrayerRequestsByUserId } from "@/services/prayer-request";
import { PrayerRequestStatus, User } from "@prisma/client";
import PrayerRequestCreate from "./prayer-request-add";

type PrayerRequestTemplateProps = {
  id: string;
  user: User;
};

export default async function PrayerRequestTemplate({
  id,
  user,
}: PrayerRequestTemplateProps) {
  const { prayerRequests } = await getPrayerRequestsByUserId(id);

  const answeredRequests = prayerRequests?.filter(
    (request) => request.status === PrayerRequestStatus.ANSWERED
  );

  const inProgressRequests = prayerRequests?.filter(
    (request) => request.status === PrayerRequestStatus.IN_PROGRESS
  );

  const archivedRequests = prayerRequests?.filter(
    (request) => request.status === PrayerRequestStatus.ARCHIVED
  );

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row justify-between">
        <h1 className="text-xl font-bold">Manage Your Prayer Requests</h1>
        <PrayerRequestCreate id={id} />
      </div>

      <Separator />
      {inProgressRequests && (
        <div>
          <div className="text-md font-bold pb-2">Current Prayer Requests</div>
          <div className="flex flex-col gap-3">
            {inProgressRequests.map((prayer) => (
              <PrayerRequestCard
                key={prayer.id}
                userId={user.id}
                prayer={prayer}
              />
            ))}
          </div>
        </div>
      )}
      {answeredRequests && (
        <div>
          <div className="text-md font-bold pb-2">Answered Prayers</div>
          <div className="flex flex-col gap-3">
            {answeredRequests.map((prayer) => (
              <PrayerRequestCard
                key={prayer.id}
                userId={user.id}
                prayer={prayer}
              />
            ))}
          </div>
        </div>
      )}
      {archivedRequests && (
        <div>
          <div className="text-md font-bold pb-2">Past Prayers</div>
          <div className="flex flex-col gap-3">
            {archivedRequests.map((prayer) => (
              <PrayerRequestCard
                key={prayer.id}
                userId={user.id}
                prayer={prayer}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
