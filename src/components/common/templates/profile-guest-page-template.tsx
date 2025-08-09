"use client";

import { Separator } from "@/components/ui";
import { Session } from "next-auth";

interface ProfileGuestPageTemplateProps {
  user: Session["user"];
}

export const ProfileGuestPageTemplate = ({
  user,
}: ProfileGuestPageTemplateProps) => {
  return (
    <div className="space-y-6 m-5">
      <div>
        <h2 className="text-xl font-semibold mb-2">{`${user.name}'s Info`}</h2>
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
    </div>
  );
};
