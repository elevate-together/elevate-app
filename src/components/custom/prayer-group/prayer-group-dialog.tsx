"use client";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/components/hooks/use-mobile";
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
import { useState } from "react";
import UserAvatar from "../user/user-avatar";
import JoinGroup from "../user/user-join-group";
import {
  DrawerTrigger,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";

type PrayerGroupDialogProps = {
  group: PrayerGroupWithOwner;
  userId: string;
};

export default function PrayerGroupDialog({
  group,
  userId,
}: PrayerGroupDialogProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  return (
    <div>
      {isMobile ? (
        <Drawer open={isMobile && open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button className="p-2" variant="outline">
              <Eye />
              View
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>
                <div className="text-2xl">{group.name}</div>
              </DrawerTitle>
              <DrawerDescription asChild>
                <div>
                  Created:{" "}
                  {new Date(group.createdAt).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </div>
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex flex-col gap-4 px-5">
              {group.description && (
                <div className="flex flex-col gap-1 text-left">
                  <p className="text-sm font-semibold">Description:</p>
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>
                </div>
              )}

              <div className="flex ">
                <div className="flex-1 flex flex-col gap-2 mb-2">
                  <p className="text-sm font-semibold">Owner:</p>
                  <UserAvatar
                    name={group.owner.name}
                    email={group.owner.email}
                    image={group.owner.image ?? undefined}
                    includeEmail={false}
                    size="small"
                  />
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <p className="text-sm font-semibold"> Group:</p>
                  <p className="text-sm color-muted mt-2">
                    {group.memberCount} members
                  </p>
                </div>
              </div>
            </div>

            <DrawerFooter className="mb-7">
              <div className="flex justify-center w-full gap-2">
                <JoinGroup
                  groupId={group.id}
                  userId={userId}
                  className=" w-full"
                  onClose={() => setOpen(false)}
                />
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open && !isMobile} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="p-2" variant="outline">
              <Eye />
              View
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className="flex flex-col">
              <DialogTitle className="text-xl">{group.name}</DialogTitle>
              <DialogDescription className="mr-5">
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

            <div className="flex ">
              <div className="flex-1 flex flex-col gap-2 mb-2">
                <p className="text-sm font-semibold">Owner:</p>
                <UserAvatar
                  name={group.owner.name}
                  email={group.owner.email}
                  image={group.owner.image ?? undefined}
                  includeEmail={false}
                  size="small"
                />
              </div>

              <div className="flex-1 flex flex-col gap-1">
                <p className="text-sm font-semibold"> Group:</p>
                <p className="text-sm color-muted mt-2">
                  {group.memberCount} members
                </p>
              </div>
            </div>

            <DialogFooter>
              <JoinGroup
                groupId={group.id}
                userId={userId}
                className="min-w-[100px]"
                onClose={() => setOpen(false)}
              />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
