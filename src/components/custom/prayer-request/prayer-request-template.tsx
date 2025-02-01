import { auth } from "@/auth";
import PrayerRequestCard from "@/components/custom/prayer-request/prayer-request-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPrayerRequestsByUserId } from "@/services/prayer-request";
import { PrayerRequestStatus, User } from "@prisma/client";
import { Hand, Package, Star, User as UserIcon } from "lucide-react";
import PrayerRequestCreate from "./prayer-request-add";

type PrayerRequestTemplateProps = {
  currUser: User;
  pageUser: User;
};

export default async function PrayerRequestTemplate({
  currUser,
  pageUser,
}: PrayerRequestTemplateProps) {
  const { prayerRequests } = await getPrayerRequestsByUserId(pageUser.id);

  const isOwner = pageUser.id == currUser.id;

  const session = await auth();

  if (!session) {
    return null;
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

  return (
    <div>
      {isOwner ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-row justify-between">
            <h1 className="text-xl font-bold h-full self-center">
              Your Prayers
            </h1>
            <PrayerRequestCreate id={currUser.id} />
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
                        user={currUser}
                        prayer={prayer}
                        isOwner={isOwner}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-3">You have no active prayer requests.</div>
              )}
            </TabsContent>
            <TabsContent value="answered">
              {answeredRequests ? (
                <div>
                  <div className="flex flex-col gap-3">
                    {answeredRequests.map((prayer) => (
                      <PrayerRequestCard
                        key={prayer.id}
                        user={currUser}
                        prayer={prayer}
                        isOwner={isOwner}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-3">
                  You have no answered prayer requests.
                </div>
              )}
            </TabsContent>
            <TabsContent value="past">
              {archivedRequests ? (
                <div>
                  <div className="flex flex-col gap-3">
                    {archivedRequests.map((prayer) => (
                      <PrayerRequestCard
                        key={prayer.id}
                        user={currUser}
                        prayer={prayer}
                        isOwner={isOwner}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-3">You have no past prayer requests.</div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-xl font-bold text-left">
              {`${pageUser.name}'s Prayer Requests`}
            </h1>
            <Button variant="outline" size="icon">
              <UserIcon />
            </Button>
          </div>

          <Separator />

          {inProgressRequests ? (
            <div>
              <div className="flex flex-col gap-3">
                {inProgressRequests.map((prayer) => (
                  <PrayerRequestCard
                    key={prayer.id}
                    user={pageUser}
                    prayer={prayer}
                    isOwner={isOwner}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div>{`${pageUser.name} doesn't have any prayer requests right now.`}</div>
          )}
        </div>
      )}
    </div>
  );
}
