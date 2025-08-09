import { NoDataDisplay } from "@/components/common";

export function UserNotFound() {
  return (
    <NoDataDisplay
      title="Hmm... We Couldn't Find That User"
      subtitle="It looks like this user doesn't exist or may have been removed. Please check the link or try searching again."
      icon="User"
    />
  );
}
