import { auth } from "@/auth";
import { NotificationPageTemplate } from "@/components/custom/templates/notification-page-template";
import PagePaddingWrapper from "@/components/custom/templates/helper/page-padding-wrapper";
import {
  getAllNotificationsForUser,
  markAllNotificationsAsRead,
} from "@/services/notification";

export default async function ProfilePage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return <div>You must be logged in to view this page.</div>;
  }

  const markAsRead = await markAllNotificationsAsRead({
    userId: session.user.id,
  });

  const allNotifications = await getAllNotificationsForUser({
    userId: session.user.id,
  });

  if (!allNotifications.success || !markAsRead.success) {
    return <div>Error getting notifications</div>;
  }

  return (
    <PagePaddingWrapper noPadding>
      <NotificationPageTemplate
        userId={session.user.id}
        notifications={allNotifications.notifications || []}
      />
    </PagePaddingWrapper>
  );
}
