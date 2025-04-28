"use client";
import NoDataDisplay from "@/components/custom/templates/helper/no-data-display";

export default function PrayerGroupNotAccepted() {
  return (
    <NoDataDisplay
      title="Request Pending"
      subtitle="You're not part of this group yet. Once the group owner approves your request, you'll be able to view the group's information."
      icon="Users"
    />
  );
}
