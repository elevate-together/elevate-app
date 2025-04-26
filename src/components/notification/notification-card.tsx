import {
  Notification,
  NotificationStatusType,
  NotificationType,
} from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { Bell, HelpingHand, Users } from "lucide-react";

export function NotificationCard({
  notification,
}: {
  notification: Notification;
}) {
  return (
    <div className=" p-4 bg-card border-b border-gray-200 shadow-sm flex items-center">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-4">
        {notification.type === NotificationType.PRAYER ? (
          <HelpingHand className="w-5 h-5 text-primary" />
        ) : notification.type === NotificationType.JOINEDGROUP ? (
          <Users className="w-5 h-5 text-primary" />
        ) : (
          <Bell className="w-5 h-5 text-primary" />
        )}
      </div>
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
  );
}
