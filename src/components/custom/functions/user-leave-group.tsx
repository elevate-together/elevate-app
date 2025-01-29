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
import { removeUserFromPrayerGroup } from "@/services/user-prayer-group";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type UserLeaveGroupProps = {
  group: PrayerGroupWithOwner;
  id: string;
};

export default function UserLeaveGroup({ group, id }: UserLeaveGroupProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    const response = await removeUserFromPrayerGroup(id, group.id);

    if (response.success) {
      toast.success(response.message);
      setOpen(false);
      router.refresh();
    } else {
      toast.error(response.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon">
          <Trash />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Are your sure you want to leave {group.name}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          This will remove you from <b>{group.name}</b>, and you won’t be able
          to view its information. You can rejoin later if you change your mind.
          Confirm if you wish to proceed.
        </DialogDescription>

        <DialogFooter>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmit}>
              Leave Group
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
