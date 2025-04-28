"use client";
import NoDataDisplay from "@/components/custom/templates/helper/no-data-display";

export default function PrayerGroupNotIn() {
  return (
    <NoDataDisplay
      title="You're not a part of this group!"
      subtitle="You're not part of this group yet. To ensure the privacy and security of the prayer requests shared within, please send a request to the group owner if you'd like to join."
      icon="ShieldX"
      includeGoBackHome
    />
  );
}
