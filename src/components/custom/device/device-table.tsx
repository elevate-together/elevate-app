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

import {
  sendTestNotificationToDevice,
  unsubscribeDevice,
} from "@/services/device";
import { Device } from "@prisma/client";
import { format, isSameDay } from "date-fns";
import {
  Bell,
  MonitorSmartphone,
  MoreVerticalIcon,
  Pencil,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import DeviceForm from "./device-form";
import NoDataDisplay from "../templates/no-data-display";

type DeviceTableProps = {
  devices: Device[];
  userId: string;
  onDeviceChange?: () => void;
};
export default function DeviceTable({
  devices,
  userId,
  onDeviceChange = () => null,
}: DeviceTableProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleTestPush = async ({ device }: { device: Device }) => {
    const { success, message } = await sendTestNotificationToDevice(
      userId,
      device.endpoint
    );

    if (!success) {
      toast.error(message);
    }
  };

  const handleRemoveDevice = async (endpoint: string) => {
    const { success, message } = await unsubscribeDevice(userId, endpoint);

    if (success) {
      router.refresh();
      if (onDeviceChange) {
        onDeviceChange();
      }
    } else {
      toast.error(message);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Your Devices</h2>

      {devices.length > 0 ? (
        <Table className="bg-transparent">
          <TableCaption className="w-[80%] m-auto text-xs">
            {`All registered devices - Please note that if you're using a mobile
          device and remove the app from your home screen, you will need to
          re-register for notifications.`}
          </TableCaption>
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
                    <div className="text-xs font-normal">
                      Added: {format(new Date(device.createdAt), "MM/dd/yy")}
                    </div>
                    <div>
                      {!isSameDay(
                        new Date(device.createdAt),
                        new Date(device.updatedAt)
                      ) && (
                        <div className="text-xs">
                          Last Updated:
                          {format(new Date(device.updatedAt), "MM/dd/yy")}
                        </div>
                      )}
                    </div>
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

                      <DropdownMenuItem
                        onSelect={() => handleRemoveDevice(device.endpoint)}
                      >
                        <div className="flex flex-row gap-2 items-center">
                          <Trash size="14px" />
                          <div>Remove</div>
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
      ) : (
        <NoDataDisplay
          title="You have no devices registered"
          subtitle="Register your device to start receiving notifications and be notified when others are praying for you."
          icon={MonitorSmartphone}
          className="py-8"
        />
      )}
    </div>
  );
}
