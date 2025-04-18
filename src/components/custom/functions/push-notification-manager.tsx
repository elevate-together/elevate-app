"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { arrayBufferToBase64, urlBase64ToUint8Array } from "@/lib/utils";

import {
  checkIfDeviceExists,
  subscribeDevice,
  unsubscribeDevice,
} from "@/services/device";
import { Check, Loader, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PushNotificationManager({
  userId,
  refreshTrigger,
}: {
  userId: string;
  refreshTrigger?: number;
}) {
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isStartLoading, setIsStartLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [supportsNotifications, setSupportsNotifications] =
    useState<boolean>(false);

  useEffect(() => {
    const checkNotifications = async () => {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        setSupportsNotifications(true);
        await checkSubscription(); // Check subscription status when the component mounts
      } else {
        setSupportsNotifications(false);
      }

      setIsStartLoading(false);
    };

    checkNotifications();
  }, [refreshTrigger]);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        setIsSubscribed(false);
        return;
      }

      const endpoint = subscription.endpoint;

      // Call the service function to check if the device exists in DB
      const exists = await checkIfDeviceExists(endpoint);

      if (!exists) {
        console.log(
          "Subscription exists in browser but not in DB, unsubscribing."
        );
        await subscription.unsubscribe(); // Clean up the subscription in the browser
      }

      setIsSubscribed(exists);
    } catch (err) {
      console.error("Error checking subscription:", err);
      setIsSubscribed(false);
    }
  };

  const checkNotificationPermission = async () => {
    try {
      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.error("You need to allow notifications to subscribe.");
          return false;
        }
      }
      return true;
    } catch (err) {
      console.error("Error requesting permission for notifications:", err);
      toast.error("Error requesting notification permissions.");
      return false;
    }
  };

  const handleAddPushSubscription = async () => {
    let sub;
    try {
      setIsLoading(true);
      const permissionGranted = await checkNotificationPermission();
      if (!permissionGranted) return;

      // Register the service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      if (!registration) return;

      // Check if the user is already subscribed
      const existingSubscription =
        await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log("Already subscribed to push notifications");
        setIsSubscribed(true);
        return;
      }

      // Subscribe to push notifications
      sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      const subscriptionData = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(sub.getKey("p256dh")),
          auth: arrayBufferToBase64(sub.getKey("auth")),
        },
      };

      if (
        !subscriptionData ||
        !subscriptionData.endpoint ||
        !subscriptionData.keys.p256dh ||
        !subscriptionData.keys.auth
      ) {
        throw new Error("Invalid subscription data");
      }

      const { success, message } = await subscribeDevice(
        subscriptionData,
        userId
      );

      if (success) {
        setIsSubscribed(true);
        toast.success(message);
        router.refresh();
      } else {
        console.error(message);
      }
    } catch (error) {
      console.error("Error adding push subscription:", error);
      toast.error("Error Adding Device to Account. Try Again");

      if (sub) {
        try {
          await sub.unsubscribe();
          console.log("Unsubscribed successfully after error");
        } catch (unsubscribeError) {
          console.error("Error unsubscribing device:", unsubscribeError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePushSubscription = async () => {
    try {
      setIsLoading(true);
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const success = await subscription.unsubscribe();

        if (success) {
          const { success: successDatabse, message } = await unsubscribeDevice(
            userId,
            subscription.endpoint
          );
          if (successDatabse) {
            setIsSubscribed(false);
            router.refresh();
            toast.success(message);
          } else {
            console.error("Failed to unsubscribe from push notifications");
          }
        } else {
          console.error("Failed to unsubscribe from push notifications");
        }
      } else {
        console.log("No subscription found to unsubscribe");
      }
    } catch (error) {
      console.error("Error unsubscribing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isStartLoading) {
    return null;
  }

  return (
    <>
      {!supportsNotifications ? (
        <div className="flex justify-center">
          <Alert variant="destructive" className="w-full">
            <AlertDescription className="flex flex-row items-center gap-3">
              <div>
                <TriangleAlert className="h-4 w-4 text-red-500" />
              </div>
              <div>
                Push notifications are not supported in this browser. If on
                mobile make sure that you add elevate to your homescreen first.
              </div>
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className="flex justify-center">
          {isSubscribed ? (
            <Alert variant="success">
              <AlertDescription>
                <div className="flex flex-col gap-2 sm:items-center justify-between md:flex-row">
                  <div>
                    <div className="flex flex-row gap-2 items-center">
                      <Check className="h-4 w-4 text-green-600" />
                      <div className="font-bold">
                        This devices is subscribed to notifications!
                      </div>
                    </div>

                    <div className="ml-6">
                      Elevate uses notifications to connect you with your
                      friends. You can unsubscribe here at any time.
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleRemovePushSubscription}
                    disabled={isLoading}
                    className="min-w-[102px]"
                  >
                    {isLoading ? (
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      "Unubscribe"
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="warning">
              <AlertDescription>
                <div className="flex flex-col gap-2 sm:items-center justify-between md:flex-row">
                  <div>
                    <div className="flex flex-row gap-2 items-center">
                      <TriangleAlert className="h-4 w-4 text-yellow-700" />
                      <div className="font-bold">Heads Up!</div>
                    </div>

                    <div className="ml-6">
                      This device is not subscribed to notifications. Enable
                      them to stay in touch with your groups and get reminders
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleAddPushSubscription}
                    disabled={isLoading}
                    className="min-w-[102px]"
                  >
                    {isLoading ? (
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      "Subscribe"
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </>
  );
}
