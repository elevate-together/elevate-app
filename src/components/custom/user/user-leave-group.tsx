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
import { removeUserFromPrayerGroup } from "@/services/user-prayer-group";
import { PrayerGroup } from "@prisma/client";
import { LogOut, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type UserLeaveGroupProps = {
  group: PrayerGroup;
  id: string;
  isRequested?: boolean;
};

export default function UserLeaveGroup({
  group,
  id,
  isRequested = false,
}: UserLeaveGroupProps) {
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
    <>
      {isRequested ? (
        <Button
          variant="ghost"
          className="w-full justify-start pl-3"
          onClick={handleSubmit}
        >
          <X /> Cancel Request
        </Button>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className=" justify-start pl-3">
              <LogOut />
              Leave Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                Are your sure you want to leave {group.name}?
              </DialogTitle>
            </DialogHeader>
            <DialogDescription>
              This will remove you from <b>{group.name}</b>, and you won’t be
              able to view its information. You can rejoin later if you change
              your mind. Confirm if you wish to proceed.
            </DialogDescription>
            <DialogFooter>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" onClick={handleSubmit}>
                  {isRequested ? "Cancel Request" : "Leave Group"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
