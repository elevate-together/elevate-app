"use server";

import db from "@/lib/db";
import {
  NotificationStatusType,
  NotificationType,
  Notification,
} from "@prisma/client";

export async function addNotification(
  title: string,
  text: string,
  type: NotificationType,
  userId: string,
  status?: NotificationStatusType
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const newNotification = await db.notification.create({
      data: {
        title,
        text,
        type,
        status: status ?? NotificationStatusType.UNREAD,
        userId,
      },
    });

    return {
      success: true,
      message: `Notification added successfully with ID: ${newNotification.id}`,
    };
  } catch (error) {
    console.error("Error adding notification:", error);
    return {
      success: false,
      message: "Could not add notification",
    };
  }
}

export async function deleteNotification(id: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const deletedNotification = await db.notification.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: `Notification with ID: ${deletedNotification.id} deleted successfully.`,
    };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return {
      success: false,
      message: "Could not delete notification",
    };
  }
}

export async function getAllNotificationsForUser(userId: string): Promise<{
  success: boolean;
  message: string;
  notifications?: Notification[];
}> {
  try {
    const notifications = await db.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      message: "Notifications retrieved successfully.",
      notifications,
    };
  } catch (error) {
    console.error("Error getting notifications:", error);
    return {
      success: false,
      message: "Could not retrieve notifications.",
    };
  }
}

export async function getNotificationCountForUser(userId: string): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  try {
    const count = await db.notification.count({
      where: {
        userId,
        status: NotificationStatusType.UNREAD,
      },
    });

    return {
      success: true,
      message: "Notification count retrieved successfully.",
      count,
    };
  } catch (error) {
    console.error("Error getting notification count:", error);
    return {
      success: false,
      message: "Could not retrieve notification count.",
    };
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const currentDate = new Date();
    await db.notification.deleteMany({
      where: {
        userId,
        status: NotificationStatusType.READ,
        updatedAt: {
          lt: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });
    await db.notification.updateMany({
      where: { userId, status: NotificationStatusType.UNREAD },
      data: { status: NotificationStatusType.READ },
    });

    return {
      success: true,
      message: "All notifications marked as read.",
    };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return {
      success: false,
      message: "Could not mark notifications as read.",
    };
  }
}

export async function deleteAllNotificationsForUser(userId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await db.notification.deleteMany({
      where: { userId },
    });

    return {
      success: true,
      message: "All notifications deleted.",
    };
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return {
      success: false,
      message: "Could not delete notifications.",
    };
  }
}
