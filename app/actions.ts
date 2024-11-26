"use server";

import webpush from "web-push";
import { PrismaClient } from "@prisma/client"; // Import Prisma client

const prisma = new PrismaClient();

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

/**
 * Subscribes a user to push notifications and associates the subscription with a user ID,
 * including device information.
 * @param sub - The push subscription object.
 * @param userId - The ID of the user to associate the subscription with.
 * @param deviceInfo - The device information to store (platform, OS version, user agent).
 */
export async function subscribeUser(
  sub: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
    expirationTime?: number | null;
  },
  userId: string,
  deviceInfo: {
    platform: string;
    osVersion: string;
    userAgent: string;
  },
) {
  if (!sub || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) {
    throw new Error("Invalid PushSubscription object: Missing keys");
  }

  const subscription = {
    endpoint: sub.endpoint,
    expirationTime: sub.expirationTime,
    keys: {
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
  } as webpush.PushSubscription;

  // Serialize the subscription object to store it as JSON
  const subscriptionString = JSON.stringify(subscription);

  // Save the subscription and device information in the database, associated with the user ID
  await prisma.device.upsert({
    where: { userId },
    update: {
      subscription: subscriptionString,
      platform: deviceInfo.platform,
      osVersion: deviceInfo.osVersion,
    }, // Update device info and subscription
    create: {
      userId,
      subscription: subscriptionString,
      platform: deviceInfo.platform,
      osVersion: deviceInfo.osVersion,
    }, // Store device info and subscription when creating a new record
  });

  return { success: true };
}

/**
 * Unsubscribes a user from push notifications by removing their subscription from the database.
 * @param userId - The ID of the user to unsubscribe.
 */
export async function unsubscribeUser(userId: string) {
  // Remove the subscription and device information from the database for the given user ID
  await prisma.device.delete({
    where: { userId },
  });
  return { success: true };
}

/**
 * Sends a push notification to a specific user based on their user ID.
 * @param userId - The ID of the user to send the notification to.
 * @param message - The message to include in the notification.
 */
export async function sendNotification(userId: string, message: string) {
  // Retrieve the user's subscription and device information from the database
  const record = await prisma.device.findUnique({
    where: { userId },
  });

  if (!record || !record.subscription) {
    throw new Error("No subscription found for the user");
  }

  let subscription: webpush.PushSubscription;

  if (typeof record.subscription === "string") {
    subscription = JSON.parse(record.subscription);
  } else {
    return { success: false, error: "Failed to send notification" };
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Notification",
        body: message,
        icon: "/icon.png",
      }),
    );
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}
