"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { sendNotificationToDevice } from "@/services/device";
import { Device } from "@prisma/client";
import { format, isSameDay } from "date-fns";
import { Bell, MoreVerticalIcon, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import DeviceForm from "./device-form";

type DeviceCardProps = {
  device: Device;
  userId: string;
};

export default function DeviceCard({ device, userId }: DeviceCardProps) {
  const [open, setOpen] = useState(false);

  const handleTestPush = async () => {
    const { success, message } = await sendNotificationToDevice(
      userId,
      device.endpoint,
      "Test"
    );

    if (success) {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-row items-center gap-3 justify-between p-4 rounded-lg border">
      <div className="text-base font-semibold">
        <h3>{device.title}</h3>
        <p className="text-xs font-normal">
          Added: {format(new Date(device.createdAt), "MM/dd/yy")}
        </p>
        <p>
          {!isSameDay(
            new Date(device.createdAt),
            new Date(device.updatedAt)
          ) && (
            <div className="text-xs">
              Last Updated:
              {format(new Date(device.updatedAt), "MM/dd/yy")}
            </div>
          )}
        </p>
      </div>
      <div className="flex flex-row items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleTestPush}>
              <div className="flex flex-row gap-2 items-center">
                <Bell size="14px" />
                <div>Test Push</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <div
                className="flex flex-row gap-2 items-center"
                onClick={() => setOpen(true)}
              >
                <Pencil size="14px" />
                <div>Rename</div>
              </div>
            </DropdownMenuItem>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename Device</DialogTitle>
                  <DeviceForm
                    device={device}
                    onSubmit={() => setOpen(false)}
                    onCancel={() => setOpen(false)}
                  />
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
