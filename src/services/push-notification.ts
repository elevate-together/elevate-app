"use server";

import db from "@/lib/db";
import { format } from "date-fns";
import webpush from "web-push";
import { getDeviceInfo } from "./get-device-info";

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function subscribeDevice(
  sub: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  },
  userId: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { vendor, os } = await getDeviceInfo();
    const name =
      vendor && os
        ? `${vendor} ${os}`
        : `Device Added: ${format(new Date(), "yyyy-MM-dd")}`;

    console.log(name);

    await db.device.upsert({
      where: { userId, endpoint: sub.endpoint },
      update: {
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      },
      create: {
        userId,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        title: name,
      },
    });

    return { success: true, message: "Device subscribed successfully" };
  } catch (error) {
    console.error("Error subscribing device:", error);
    return { success: false, message: "Failed to subscribe device" };
  }
}

export async function unsubscribeDevice(
  userId: string,
  endpoint: string
): Promise<{
  success: boolean;
  message: string;
}> {
  if (!userId || !endpoint) {
    return { success: false, message: "User ID or Endpoint is missing" };
  }

  try {
    const device = await db.device.delete({
      where: { userId, endpoint },
    });

    if (!device) {
      return {
        success: false,
        message: "Device not found for the user with the provided endpoint",
      };
    }

    return { success: true, message: "Device unsubscribed successfully" };
  } catch (error) {
    console.error("Error unsubscribing device:", error);
    return { success: false, message: "Failed to unsubscribe device" };
  }
}

export async function sendNotificationToDevice(
  userId: string,
  endpoint: string,
  message: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Retrieve the device associated with the user and the specified endpoint
    const device = await db.device.findUnique({
      where: { userId, endpoint }, // Query by userId and endpoint
    });

    if (!device) {
      return { success: false, message: "Device not found for the user" };
    }

    // Construct the subscription object from the device details
    const subscription: webpush.PushSubscription = {
      endpoint: device.endpoint,
      keys: {
        p256dh: device.p256dh,
        auth: device.auth,
      },
    };

    // Send the push notification to the specific device
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: "Notification",
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
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, message: "Failed to send notification" };
  }
}
export async function sendNotificationAllDevices(
  userId: string,
  message: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Retrieve all devices associated with the user
    const devices = await db.device.findMany({
      where: { userId },
    });

    if (!devices || devices.length === 0) {
      return { success: false, message: "No devices found for the user" };
    }

    // Loop through all devices and send notification to each
    for (const device of devices) {
      const response = await sendNotificationToDevice(
        userId,
        device.endpoint,
        message
      );

      if (!response.success) {
        console.error(
          `Failed to send notification to device ${device.endpoint}: ${response.message}`
        );
      }
    }

    return {
      success: true,
      message: "Notification sent successfully to all devices",
    };
  } catch (error) {
    console.error("Error sending push notifications:", error);
    return { success: false, message: "Failed to send notification" };
  }
}
