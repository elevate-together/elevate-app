import { Separator } from "@/components/ui/separator";
import { getPrayerRequestsByUserId } from "@/services/prayer-request";
import { User } from "@prisma/client";
import PrayerRequestCard from "./prayer-request-card";
import PrayerRequestForm from "./prayer-request-form";

type PrayerRequestTemplateProps = {
  id: string;
  user: User;
};

export default async function PrayerRequestTemplate({
  id,
  user,
}: PrayerRequestTemplateProps) {
  const { prayerRequests } = await getPrayerRequestsByUserId(id);

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold">{user.name}</h1>
      </div>
      <PrayerRequestForm userId={user.id} />
      <Separator />
      {prayerRequests && (
        <div>
          <div className="text-md font-bold pb-2">All Prayer Requests</div>
          {prayerRequests.map((prayer) => (
            <PrayerRequestCard
              key={prayer.id}
              userId={user.id}
              prayer={prayer}
            />
          ))}
        </div>
      )}
    </div>
  );
}
