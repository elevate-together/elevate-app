"use client";

import { PrayerGroupCard, PrayerGroupCreate } from "@/components/data-handlers";
import { PrayerGroup } from "@prisma/client";
import { Session } from "next-auth";

type Props = {
  user: Session["user"];
  yourGroups: PrayerGroup[];
  pendingGroups: PrayerGroup[];
};

export function PrayerGroupAllPageTemplate({
  user,
  yourGroups,
  pendingGroups,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center justify-between">
        <div className="text-xl font-semibold">Your Groups</div>
        <PrayerGroupCreate userId={user.id} />
      </div>

      <div className="flex flex-col">
        {yourGroups.length > 0 && (
          <div className="flex flex-col gap-0">
            {yourGroups.map((group) => (
              <div key={group.id}>
                <PrayerGroupCard prayerGroup={group} userId={user.id} />
              </div>
            ))}
          </div>
        )}

        {pendingGroups.length > 0 && (
          <div className="flex flex-col gap-0">
            {pendingGroups.map((group) => (
              <div key={group.id}>
                <PrayerGroupCard prayerGroup={group} userId={user.id} pending />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
