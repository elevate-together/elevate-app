import { auth } from "@/auth";
import { NotificationPageTemplate } from "@/components/custom/templates/notification-template";
import PagePaddingWrapper from "@/components/custom/templates/page-padding-wrapper";
import { getAllNotificationsForUser } from "@/services/notification";

export default async function ProfilePage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return <div>You must be logged in to view this page.</div>;
  }

  const data = await getAllNotificationsForUser(session.user.id);

  if (!data.success) {
    return <div>Error getting notifications: {data.message}</div>;
  }

  return (
    <PagePaddingWrapper noPadding>
      <NotificationPageTemplate
        userId={session.user.id}
        notifications={data.notifications || []}
      />
    </PagePaddingWrapper>
  );
}
