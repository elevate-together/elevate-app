"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

type DeviceTableProps = {
  devices: Device[];
  userId: string;
};
export default function DeviceTable({ devices, userId }: DeviceTableProps) {
  const [open, setOpen] = useState(false);

  const handleTestPush = async ({ device }: { device: Device }) => {
    const { success, message } = await sendNotificationToDevice(
      userId,
      device.endpoint,
      "Your device has successfully been connected!",
      "Test Push"
    );

    if (success) {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Your Devices</h2>

      <Table>
        <TableCaption>All registered devices</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead hidden>Device</TableHead>
            <TableHead hidden>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell className="font-medium">
                <div className="m-3">
                  <h3 className="text-base font-semibold">{device.title}</h3>
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
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreVerticalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleTestPush({ device })}
                    >
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
