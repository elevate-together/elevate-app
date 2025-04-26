"use client";

import { Separator } from "@/components/ui/separator";
import { Notification } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  deleteAllNotificationsForUser,
  markAllNotificationsAsRead,
} from "@/services/notification";
import { toast } from "sonner";
import { NotificationCard } from "@/components/notification/notification-card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader } from "lucide-react";

interface NotificationPageTemplateProps {
  notifications: Notification[];
  userId: string;
}

export const NotificationPageTemplate = ({
  notifications,
  userId,
}: NotificationPageTemplateProps) => {
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [readLoading, setReadLoading] = useState(false);

  const handleDeleteAllNotifications = async () => {
    setDeleteLoading(true);
    const res = await deleteAllNotificationsForUser(userId);

    if (res.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
    setDeleteLoading(false);
  };

  const handleReadAllNotifications = async () => {
    setReadLoading(true);
    const res = await markAllNotificationsAsRead(userId);

    if (res.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
    setReadLoading(false);
  };

  return (
    <div>
      <div className="flex justify-between p-2 gap-2 items-center">
        <div className="font-bold ml-2">Your Notifications</div>
        <div className="flex flex-row gap-1 items-center">
          <Button
            variant="ghost"
            onClick={handleReadAllNotifications}
            disabled={readLoading}
            className="w-[120px] flex justify-center items-center"
          >
            {readLoading ? (
              <Loader className="animate-spin h-4 w-4 mr-2" />
            ) : (
              "Mark All Read"
            )}
          </Button>
          <Separator orientation="vertical" className="h-6 w-px bg-primary" />
          <Button
            variant="ghost"
            onClick={handleDeleteAllNotifications}
            disabled={deleteLoading}
            className="w-[92px] flex justify-center items-center"
          >
            {deleteLoading ? (
              <Loader className="animate-spin h-4 w-4 " />
            ) : (
              "Delete All"
            )}
          </Button>
        </div>
      </div>
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))
      ) : (
        <p>No notifications to display.</p>
      )}
    </div>
  );
};
