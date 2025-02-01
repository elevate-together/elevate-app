"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PrayerGroupWithOwner } from "@/lib/utils";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import UserAvatar from "../user/user-avatar";
import JoinGroup from "../user/user-join-group";

type PrayerGroupDialogProps = {
  group: PrayerGroupWithOwner;
  userId: string;
};

export default function PrayerGroupDialog({
  group,
  userId,
}: PrayerGroupDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="p-2" variant="outline">
          <Eye />
          View
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="items-start">
          <DialogTitle className="text-xl">{group.name}</DialogTitle>
          <DialogDescription>
            Created:{" "}
            {new Date(group.createdAt).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </DialogDescription>
        </DialogHeader>

        {group.description && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">Description:</p>
            <div>{group.description}</div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Owner:</p>
          <UserAvatar
            name={group.owner.name}
            email={group.owner.email}
            image={group.owner.image ?? undefined}
            includeEmail={false}
            size="small"
          />
        </div>

        <DialogFooter>
          <Button
            type="submit"
            variant="secondary"
            onClick={() => {
              router.push(`/groups/${group.id}`);
            }}
          >
            View More
          </Button>
          <JoinGroup
            groupId={group.id}
            userId={userId}
            onClose={() => setOpen(false)}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
