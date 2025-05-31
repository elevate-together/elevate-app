"use client";

import { Device, User } from "@prisma/client";
import PushNotificationManager from "@/components/custom/helpers/push-notification-manager";
import { Separator } from "@/components/ui/separator";
import DeviceTable from "@/components/custom/device/device-table";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserForm from "./handlers/user-form";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignOut from "./buttons/user-sign-out";

type UserProfileDevicesProps = {
  devices: Device[] | undefined;
  user: User;
};
export default function UserProfileDevices({
  devices,
  user,
}: UserProfileDevicesProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isEdit, setIsEdit] = useState(false);

  const handleDeviceChange = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-4">
      <PushNotificationManager
        userId={user.id}
        refreshTrigger={refreshTrigger}
      />
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="py-4 px-2">
          <div className="flex justify-between items-center ">
            <h2 className="text-xl font-semibold">Your Info</h2>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEdit(!isEdit)}
            >
              <Edit />
            </Button>
          </div>
          <Separator className="my-4" />
          <UserForm
            user={user}
            isEdit={isEdit}
            onCancel={() => setIsEdit(false)}
            onSubmit={() => setIsEdit(false)}
          />

          <SignOut variant="secondary" className="mt-8 w-full" />
        </TabsContent>
        <TabsContent value="devices" className="py-4 px-2">
          {devices && (
            <DeviceTable
              devices={devices}
              userId={user.id}
              onDeviceChange={handleDeviceChange}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
