import NoDataDisplay from "@/components/custom/templates/helper/no-data-display";

export default function PrayerGroupNotFound() {
  return (
    <NoDataDisplay
      title="We Couldn't Find That Prayer Group"
      subtitle="This prayer group might have been removed or the link could be broken. Please check and try again!"
      icon="Users"
      includeGoBackHome
    />
  );
}
