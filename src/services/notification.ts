"use server";

import prisma from "@/lib/prisma";
import {
  NotificationStatusType,
  NotificationType,
  Notification,
} from "@prisma/client";
import { ObjectId } from "mongodb";

export async function addNotification({
  title,
  text,
  type,
  link,
  userId,
  status = NotificationStatusType.UNREAD,
}: {
  title: string;
  text: string;
  type: NotificationType;
  link: string;
  userId: string;
  status?: NotificationStatusType;
}): Promise<{
  success: boolean;
  message: string;
  notification: Notification | null;
}> {
  try {
    const newNotification = await prisma.notification.create({
      data: {
        title,
        text,
        type,
        link,
        status: status ?? NotificationStatusType.UNREAD,
        userId,
      },
    });

    return {
      success: true,
      message: "Notification added successfully",
      notification: newNotification,
    };
  } catch {
    return {
      success: false,
      message: "Could not add notification",
      notification: null,
    };
  }
}

export async function deleteNotification({ id }: { id: string }): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid ID format",
      };
    }

    await prisma.notification.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: `Notification deleted successfully.`,
    };
  } catch {
    return {
      success: false,
      message: "Could not delete notification",
    };
  }
}

export async function getAllNotificationsForUser({
  userId,
}: {
  userId: string;
}): Promise<{
  success: boolean;
  message: string;
  notifications: Notification[] | null;
}> {
  try {
    if (!ObjectId.isValid(userId)) {
      return {
        success: false,
        message: "Invalid ID format",
        notifications: null,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
        notifications: null,
      };
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      message:
        notifications.length > 0
          ? "Notifications retrieved successfully."
          : "No notifications found.",
      notifications: notifications.length > 0 ? notifications : null,
    };
  } catch {
    return {
      success: false,
      message: "Could not retrieve notifications.",
      notifications: null,
    };
  }
}

export async function getNotificationCountForUser({
  userId,
}: {
  userId: string;
}): Promise<{
  success: boolean;
  message: string;
  count: number | null;
}> {
  try {
    if (!ObjectId.isValid(userId)) {
      return {
        success: false,
        message: "Invalid ID format",
        count: null,
      };
    }
    const count = await prisma.notification.count({
      where: {
        userId,
        status: NotificationStatusType.UNREAD,
      },
    });

    return {
      success: true,
      message: "Notification count retrieved successfully.",
      count: count,
    };
  } catch {
    return {
      success: false,
      message: "Could not retrieve notification count.",
      count: null,
    };
  }
}

export async function markAllNotificationsAsRead({
  userId,
}: {
  userId: string;
}): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!ObjectId.isValid(userId)) {
      return {
        success: false,
        message: "Invalid ID format",
      };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const currentDate = new Date();
    await prisma.notification.deleteMany({
      where: {
        userId,
        status: NotificationStatusType.READ,
        updatedAt: {
          lt: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });
    await prisma.notification.updateMany({
      where: { userId, status: NotificationStatusType.UNREAD },
      data: { status: NotificationStatusType.READ },
    });

    return {
      success: true,
      message: "All notifications marked as read.",
    };
  } catch {
    return {
      success: false,
      message: "Could not mark notifications as read.",
    };
  }
}

export async function deleteAllNotificationsForUser({
  userId,
}: {
  userId: string;
}): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!ObjectId.isValid(userId)) {
      return {
        success: false,
        message: "Invalid ID format",
      };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    await prisma.notification.deleteMany({
      where: { userId },
    });

    return {
      success: true,
      message: "All notifications deleted.",
    };
  } catch {
    return {
      success: false,
      message: "Could not delete notifications.",
    };
  }
}
