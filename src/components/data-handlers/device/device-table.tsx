"use client";

import { NoDataDisplay, SidebarButton } from "@/components/common";
import { DeviceForm } from "@/components/data-handlers";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
} from "@/components/ui";

import {
  sendTestNotificationToDevice,
  unsubscribeDevice,
} from "@/services/device";
import { Device } from "@prisma/client";
import { format, isSameDay } from "date-fns";
import { Bell, MoreVerticalIcon, Pencil, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type DeviceTableProps = {
  devices: Device[];
  userId: string;
  onDeviceChange?: () => void;
};
export function DeviceTable({
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
    const { success, message } = await unsubscribeDevice({
      userId: userId,
      endpoint: endpoint,
    });

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
                    <DropdownMenuContent side="bottom" align="end">
                      <DropdownMenuItem asChild>
                        <SidebarButton
                          onClick={() => handleTestPush({ device })}
                        >
                          <Bell />
                          Test Push
                        </SidebarButton>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <SidebarButton
                          className="flex flex-row gap-2 items-center"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpen(!open);
                          }}
                        >
                          <Pencil />
                          Rename
                        </SidebarButton>
                      </DropdownMenuItem>

                      <DropdownMenuItem>
                        <SidebarButton
                          onClick={() => handleRemoveDevice(device.endpoint)}
                        >
                          <Trash size="14px" />
                          Remove
                        </SidebarButton>
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
          icon="MonitorSmartphone"
          className="py-8"
        />
      )}
    </div>
  );
}
