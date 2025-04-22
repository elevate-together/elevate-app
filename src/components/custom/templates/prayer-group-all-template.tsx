"use client";

import { PrayerGroup, User } from "@prisma/client";
import UserLeaveGroup from "../user/user-leave-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon } from "lucide-react";
import PrayerGroupCreate from "../prayer-group/prayer-group-create";
import PrayerGroupView from "../prayer-group/prayer-group-view";
import PrayerGroupJoin from "../prayer-group/prayer-group-join";
import { PrayerGroupWithOwnerAndUsers } from "@/lib/utils";

type Props = {
  user: User;
  yourGroups: PrayerGroup[];
  pendingGroups: PrayerGroup[];
  remainingGroups: PrayerGroupWithOwnerAndUsers[];
};

export default function PrayerGroupAllTemplate({
  user,
  yourGroups,
  pendingGroups,
  remainingGroups,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <div className="text-xl font-semibold">Your Groups</div>
        <PrayerGroupCreate id={user.id} />
      </div>

      <div className="flex flex-col gap-3">
        {yourGroups.length > 0 && (
          <div className="flex flex-col gap-3">
            {yourGroups.map((group) => (
              <div
                key={group.id}
                className="bg-card flex flex-row items-center gap-3 justify-between p-4 rounded-lg border"
              >
                <h3 className="text-base font-semibold">{group.name}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <EllipsisVerticalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="flex flex-col" align="end">
                    <DropdownMenuItem disabled>Actions</DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <PrayerGroupView id={group.id} />
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <UserLeaveGroup group={group} id={user.id} />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}

        {pendingGroups.length > 0 && (
          <div className="flex flex-col gap-3">
            {pendingGroups.map((group) => (
              <div
                key={group.id}
                className="bg-card flex flex-row items-center gap-3 justify-between p-4 rounded-lg border"
              >
                <h3 className="text-base font-semibold">{group.name}</h3>
                <div className="flex gap-1 items-center">
                  <Badge variant="outline">Pending Approval</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <EllipsisVerticalIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <UserLeaveGroup
                          group={group}
                          id={user.id}
                          isRequested
                        />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {remainingGroups.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">Looking for your group?</h2>
          <PrayerGroupJoin data={remainingGroups} userId={user.id} />
        </div>
      )}
    </div>
  );
}
