import NoDataDisplay from "@/components/custom/templates/helper/no-data-display";

export default function PrayerRequestNotFound() {
  return (
    <NoDataDisplay
      title="Unable to Load Prayer Requests"
      subtitle="We encountered an issue while trying to load the prayer requests. Please check your internet connection or try again later."
      icon="HelpingHand"
    />
  );
}
