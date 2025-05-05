"use server";

import db from "@/lib/db";
import { format } from "date-fns";
import webpush from "web-push";
import { getDeviceInfo } from "@/services/get-device-info";
import { getUsersInPrayerGroup } from "@/services/user-prayer-group";
import { getUserById } from "@/services/user";
import { addNotification } from "@/services/notification";
import { Device, NotificationType } from "@prisma/client";
import { ResponseMessage } from "@/lib/utils";
import { ObjectId } from "mongodb";

if (
  !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  !process.env.VAPID_PRIVATE_KEY
) {
  throw new Error("VAPID keys are not set in environment variables.");
}

webpush.setVapidDetails(
  "mailto:hebeforeme3@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function subscribeDevice({
  sub,
  userId,
  name,
}: {
  sub: { endpoint: string; keys: { p256dh: string; auth: string } };
  userId: string;
  name?: string;
}): Promise<ResponseMessage> {
  try {
    if (!ObjectId.isValid(userId)) {
      return {
        success: false,
        message: "Invalid ID format",
      };
    }
    const { vendor, os } = await getDeviceInfo();
    const deviceName =
      vendor && os
        ? `${vendor} ${os}`
        : `Device Added: ${format(new Date(), "yyyy-MM-dd")}`;

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    await db.device.upsert({
      where: { userId_endpoint: { userId, endpoint: sub.endpoint } },
      update: {
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        title: name ?? deviceName,
      },
      create: {
        userId,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        title: deviceName,
      },
    });

    return { success: true, message: "Device subscribed successfully" };
  } catch {
    return { success: false, message: "Failed to subscribe device" };
  }
}

export async function unsubscribeDevice(
  userId: string,
  endpoint: string
): Promise<ResponseMessage> {
  if (!userId || !endpoint) {
    return { success: false, message: "User ID or Endpoint is missing" };
  }

  try {
    await db.device.delete({
      where: { userId_endpoint: { userId, endpoint } },
    });

    return { success: true, message: "Device unsubscribed successfully" };
  } catch {
    return { success: false, message: "Failed to unsubscribe device" };
  }
}

export async function sendNotificationToGroups(
  sharedWithGroups: { id: string }[],
  userId: string,
  notificationLink: string
) {
  const usersToNotify = new Set<string>();

  for (const group of sharedWithGroups) {
    const groupData = await getUsersInPrayerGroup(group.id);
    if (groupData.success && groupData.users) {
      groupData.users.forEach((user) => {
        if (user.id !== userId) {
          usersToNotify.add(user.id);
        }
      });
    }
  }

  const { user } = await getUserById({ id: userId });

  await Promise.all(
    Array.from(usersToNotify).map((tempId) =>
      sendNotificationAllDevices(
        tempId,
        `${user?.name || "Someone"} shared a prayer request with you!`,
        NotificationType.PRAYER,
        notificationLink,
        "New Prayer Request"
      )
    )
  );
}

export async function sendNotificationToDevice(
  userId: string,
  endpoint: string,
  message: string,
  title = "Notification"
): Promise<ResponseMessage> {
  try {
    const device = await db.device.findUnique({
      where: { userId_endpoint: { userId, endpoint } },
    });

    if (!device) {
      return { success: false, message: "Device not found for the user" };
    }

    const subscription: webpush.PushSubscription = {
      endpoint: device.endpoint,
      keys: { p256dh: device.p256dh, auth: device.auth },
    };

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title,
        body: message,
        icon: "/icon.png",
      })
    );

    return {
      success: true,
      message: "Notification sent successfully to the device",
    };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return {
      success: false,
      message: "Failed to send notification to the device",
    };
  }
}

export async function sendNotificationAllDevices(
  userId: string,
  message: string,
  notificationType: NotificationType,
  notificationLink: string,
  title: string
): Promise<ResponseMessage> {
  try {
    const devices = await db.device.findMany({ where: { userId } });

    const notification = await addNotification({
      title,
      text: message,
      type: notificationType,
      link: notificationLink,
      userId,
    });

    if (!notification.success) {
      return {
        success: false,
        message: `Failed to log notification in database: ${notification.message}`,
      };
    }

    if (devices.length === 0) {
      return {
        success: true,
        message: "User doesn't have notifications enabled",
      };
    }

    await Promise.allSettled(
      devices.map((device) =>
        sendNotificationToDevice(userId, device.endpoint, message, title)
      )
    );

    return { success: true, message: "Notification sent successfully." };
  } catch (error) {
    console.error("Error sending push notifications:", error);
    return { success: false, message: "Failed to send notification" };
  }
}

export async function updateDeviceTitle(
  deviceId: string,
  title: string
): Promise<ResponseMessage> {
  try {
    await db.device.update({
      where: { id: deviceId },
      data: { title },
    });

    return { success: true, message: "Device updated successfully" };
  } catch (error) {
    console.error("Error updating device:", error);
    return { success: false, message: "Failed to update device" };
  }
}

export async function checkIfDeviceExists(endpoint: string): Promise<boolean> {
  try {
    const device = await db.device.findUnique({ where: { endpoint } });
    return !!device;
  } catch (error) {
    console.error("Error checking device existence:", error);
    return false;
  }
}

export async function sendTestNotificationToDevice(
  userId: string,
  endpoint: string
): Promise<ResponseMessage> {
  try {
    const device = await db.device.findUnique({
      where: { userId_endpoint: { userId, endpoint } },
    });

    if (!device) {
      return { success: false, message: "Device not found for the user" };
    }

    const title = "Test Notification";
    const link = `/user/${userId}`;
    const message =
      "Your device has successfully been subscribed to receive notifications!";

    const notification = await addNotification({
      title,
      text: message,
      type: NotificationType.TESTPUSH,
      link,
      userId,
    });

    if (!notification.success) {
      return {
        success: false,
        message: `Failed to log notification in database: ${notification.message}`,
      };
    }

    const subscription: webpush.PushSubscription = {
      endpoint: device.endpoint,
      keys: { p256dh: device.p256dh, auth: device.auth },
    };

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title,
        body: message,
        icon: "/icon.png",
      })
    );

    return { success: true, message: "Test notification sent successfully." };
  } catch (error) {
    console.error("Error sending test push notification:", error);
    return { success: false, message: "Failed to send test notification" };
  }
}

// GET device info for a user
export async function getUserDevices(userId: string): Promise<{
  success: boolean;
  message: string;
  devices?: Device[];
}> {
  try {
    const devices = await db.device.findMany({
      where: { userId },
    });

    if (!devices || devices.length === 0) {
      return { success: false, message: "No devices found for the user" };
    }

    return {
      success: true,
      message: "Devices retrieved successfully",
      devices,
    };
  } catch (error) {
    console.error("Error fetching user devices:", error);
    return { success: false, message: "Failed to fetch devices" };
  }
}
