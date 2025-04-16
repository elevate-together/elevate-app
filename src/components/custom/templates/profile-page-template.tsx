// components/custom/templates/profile-client-template.tsx

"use client";

import { Separator } from "@/components/ui/separator";
import UserProfileDevices from "@/components/custom/user/user-profile-devices";
import { Device, User } from "@prisma/client";

interface ProfilePageTemplateProps {
  isOwner: boolean;
  user: User;
  devices: Device[];
}

export const ProfilePageTemplate = ({
  isOwner,
  user,
  devices,
}: ProfilePageTemplateProps) => {
  return (
    <div className="space-y-6">
      {isOwner ? (
        <UserProfileDevices devices={devices} user={user} />
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {`${user.name}'s Info`}
          </h2>
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
          </div>
        </div>
      )}
    </div>
  );
};
