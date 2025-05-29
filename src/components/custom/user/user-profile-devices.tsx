"use client";

import { Device, User } from "@prisma/client";
import PushNotificationManager from "@/components/custom/helpers/push-notification-manager";
import { Separator } from "@/components/ui/separator";
import DeviceTable from "@/components/custom/device/device-table";
import { useState } from "react";
import { getIanafromEnumKey } from "@/lib/utils";

type UserProfileDevicesProps = {
  devices: Device[] | undefined;
  user: User;
};
export default function UserProfileDevices({
  devices,
  user,
}: UserProfileDevicesProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDeviceChange = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <PushNotificationManager
        userId={user.id}
        refreshTrigger={refreshTrigger}
      />
      <div>
        <h2 className="text-xl font-semibold mb-2">Your Info</h2>
        <Separator className="my-4" />
        <div className="flex flex-col gap-4 md:flex-row md:gap-8 mx-4">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-semibold">Name:</div>
            <div>{user.name}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-sm font-semibold">Email:</div>
            <div>{user.email}</div>
          </div>
          {user.timeZone && (
            <div className="flex flex-col gap-1">
              <div className="text-sm font-semibold">TimeZone:</div>
              <div>{getIanafromEnumKey(user.timeZone)}</div>
            </div>
          )}
        </div>
      </div>
      {devices && (
        <DeviceTable
          devices={devices}
          userId={user.id}
          onDeviceChange={handleDeviceChange}
        />
      )}
    </div>
  );
}
