"use client";

import { Badge, RoundedImage } from "@/components/ui";
import { PrayerGroup } from "@prisma/client";

import Link from "next/link";
import { UserLeaveGroup } from "@/components/data-handlers";

type PrayerGroupCardProps = {
  userId: string;
  prayerGroup: PrayerGroup;
  pending?: boolean;
};

export function PrayerGroupCard({
  prayerGroup,
  userId,
  pending = false,
}: PrayerGroupCardProps) {
  return (
    <div className="flex items-center justify-between border-b gap-4">
      <Link href={`/group/${prayerGroup.id}`} className="flex-1">
        <div className="flex items-center justify-start gap-2 py-4">
          <RoundedImage
            src={
              prayerGroup.imageUrl
                ? prayerGroup.imageUrl
                : "https://kpfusvtzlmxikzmu.public.blob.vercel-storage.com/apple-icon.png"
            }
            alt={prayerGroup.name || "Prayer Group Image"}
            className="min-w-24"
            priority
          />
          <div className="flex flex-col items-start">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold leading-tight">
                {prayerGroup.name}
              </h3>
              {pending && <Badge variant="outline">Pending Approval</Badge>}
            </div>
            {prayerGroup.description && (
              <p className="text-sm text-muted-foreground leading-tight">
                {prayerGroup.description}
              </p>
            )}
          </div>
        </div>
      </Link>
      <UserLeaveGroup
        group={prayerGroup}
        userId={userId}
        isRequested={pending}
      />
    </div>
  );
}
