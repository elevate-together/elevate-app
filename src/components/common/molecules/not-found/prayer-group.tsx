import { NoDataDisplay } from "@/components/common";

export function PrayerGroupNotFound() {
  return (
    <NoDataDisplay
      title="We Couldn't Find That Prayer Group"
      subtitle="This prayer group might have been removed or the link could be broken. Please check and try again!"
      icon="Users"
      includeGoBackHome
    />
  );
}
