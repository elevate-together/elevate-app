"use client";

import { Notification } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { deleteAllNotificationsForUser } from "@/services/notification";
import { NotificationCard } from "@/components/notification/notification-card";
import { useEffect, useState } from "react";
import { useNotificationStore } from "@/services/stores/notification";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PartyPopper } from "lucide-react";
import PushNotificationManager from "../functions/push-notification-manager";
import NoDataDisplay from "./no-data-display";

interface NotificationPageTemplateProps {
  notifications: Notification[];
  userId: string;
}

export const NotificationPageTemplate = ({
  notifications,
  userId,
}: NotificationPageTemplateProps) => {
  const { setCount } = useNotificationStore();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setCount(0);
  }, [setCount]);

  const handleDeleteAllNotifications = async () => {
    setDeleteLoading(true);
    const res = await deleteAllNotificationsForUser(userId);
    if (res.success) {
      router.refresh();
    } else {
      toast.error(res.message);
    }
    setDeleteLoading(false);
  };

  return (
    <div className="flex flex-col flex-1 min-h-full">
      <PushNotificationManager userId={userId} className="p-4" hideSubscribed />

      {notifications.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-col">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>

          <div className="flex flex-1 flex-col items-center space-y-2">
            <div className="text-sm text-primary font-bold">
              Read notifications will be deleted after seven days.
            </div>
            <Button
              variant="link"
              className="underline py-0 h-6"
              onClick={handleDeleteAllNotifications}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete all notifications"}
            </Button>
          </div>
        </div>
      ) : (
        <NoDataDisplay
          title=" You're all caught up with notifications."
          subtitle="No new updates at the moment. Enjoy your day!"
          icon={PartyPopper}
        />
      )}
    </div>
  );
};
