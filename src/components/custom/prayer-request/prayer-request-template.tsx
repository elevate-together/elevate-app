import { auth } from "@/auth";
import PrayerRequestCard from "@/components/custom/prayer-request/prayer-request-card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPrayerRequestsByUserId } from "@/services/prayer-request";
import { PrayerRequestStatus, User } from "@prisma/client";
import { Hand, Package, Star } from "lucide-react";
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

  const session = await auth();

  if (!session) {
    
  }

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
        <h1 className="text-xl font-bold h-full self-center">Your Prayers</h1>
        <PrayerRequestCreate id={id} />
      </div>

      <Separator />

      <Tabs defaultValue="request" className="w-full">
        <TabsList>
          <TabsTrigger value="request">
            <Hand size="15px" strokeWidth="1.7px" className="mr-1" />
            Requests
          </TabsTrigger>
          <Separator orientation="vertical" className="h-[65%]" />
          <TabsTrigger value="answered">
            <Star size="15px" strokeWidth="1.7px" className="mr-1" />
            Answered
          </TabsTrigger>
          <Separator orientation="vertical" className="h-[65%]" />
          <TabsTrigger value="past">
            <Package size="15px" strokeWidth="1.7px" className="mr-1" />
            Past
          </TabsTrigger>
        </TabsList>
        <TabsContent value="request">
          {inProgressRequests ? (
            <div>
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
          ) : (
            <div>No current prayer requests</div>
          )}
        </TabsContent>
        <TabsContent value="answered">
          {answeredRequests ? (
            <div>
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
          ) : (
            <div>No answered prayers</div>
          )}
        </TabsContent>
        <TabsContent value="past">
          {archivedRequests ? (
            <div>
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
          ) : (
            <div>No past prayers</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
