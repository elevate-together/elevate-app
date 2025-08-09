"use client";

import { Device } from "@prisma/client";
import {
  Button,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { useState } from "react";
import { Edit } from "lucide-react";
import { PushNotificationManager } from "@/components/common";
import { DeviceTable, SignOut, UserForm } from "@/components/data-handlers";
import { Session } from "next-auth";

type ProfileUserPageTemplateProps = {
  devices: Device[];
  user: Session["user"];
};
export function ProfileUserPageTemplate({
  devices,
  user,
}: ProfileUserPageTemplateProps) {
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
