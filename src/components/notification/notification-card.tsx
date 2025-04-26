import { Notification, NotificationStatusType } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

export function NotificationCard({
  notification,
}: {
  notification: Notification;
}) {
  return (
    <div className="p-4 px-6 bg-card mb-1 shadow-sm">
      <div className="flex items-start">
        {/* <Avatar /> */}
        <div className="flex-1">
          <div className="text-md font-bold text-primary">
            {notification.title}
          </div>
          <div className="text-sm text-primary">{notification.text}</div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>

        {notification.status === NotificationStatusType.UNREAD && (
          <span className="h-2 w-2 rounded-full bg-primary mt-1" />
        )}
      </div>
    </div>
  );
}
