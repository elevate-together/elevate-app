"use client";

import { PrayerGroup } from "@prisma/client";
import UserLeaveGroup from "@/components/custom/user/buttons/user-leave-group";
import PrayerGroupView from "./buttons/prayer-group-view";
import { Badge } from "@/components/ui/badge";

type PrayerGroupCardProps = {
  prayerGroup: PrayerGroup;
  pending?: boolean;
};

export default function PrayerGroupRow({
  prayerGroup,
  pending = false,
}: PrayerGroupCardProps) {
  return (
    <div className="flex flex-row items-center justify-between py-4 border-b">
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold">{prayerGroup.name}</h3>
          {pending && <Badge variant="outline">Pending Approval</Badge>}
        </div>

        {prayerGroup.description && (
          <p className="text-sm text-muted-foreground">
            {prayerGroup.description}
          </p>
        )}
      </div>

      <div>
        <PrayerGroupView id={prayerGroup.id} />
        <UserLeaveGroup
          group={prayerGroup}
          id={prayerGroup.id}
          isRequested={pending}
        />
      </div>
    </div>
  );
}
