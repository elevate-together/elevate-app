"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { arrayBufferToBase64, urlBase64ToUint8Array } from "@/lib/utils";

import {
  subscribeDevice,
  unsubscribeDevice,
} from "@/services/push-notification";
import { Check, Loader, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PushNotificationManager({
  userId,
}: {
  userId: string;
}) {
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [supportsNotifications, setSupportsNotifications] =
    useState<boolean>(false);

  useEffect(() => {
    const checkNotifications = async () => {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        setSupportsNotifications(true);
        await checkSubscription();
      } else {
        setSupportsNotifications(false);
      }

      setIsLoading(false);
    };

    checkNotifications();

    // Listen for subscription changes
    const handleSubscriptionChange = () => {
      checkSubscription();
    };

    window.addEventListener("subscriptionChange", handleSubscriptionChange);

    // Cleanup on unmount
    return () => {
      window.removeEventListener(
        "subscriptionChange",
        handleSubscriptionChange
      );
    };
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription status:", error);
    }
  };

  const handleAddPushSubscription = async () => {
    let sub;
    try {
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
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      {!supportsNotifications ? (
        <div className="flex justify-center">
          <Alert variant="destructive" className="max-w-xl">
            <TriangleAlert className="h-4 w-4 text-red-500" />
            <AlertDescription>
              Push notifications are not supported in this browser. Make sure
              your phone is up to date.
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className="flex justify-center">
          {isSubscribed ? (
            <Alert variant="success" className="max-w-xl">
              <AlertTitle className="font-bold">
                <div className="flex flex-row gap-1 items-center">
                  <Check className="h-4 w-4 text-green-600" />
                  <div className="font-bold">
                    This devices is subscribed to notifications!
                  </div>
                </div>
              </AlertTitle>
              <AlertDescription>
                <div className="flex flex-col md:flex-row gap-5">
                  <div>
                    Elevate uses notifications to connect you with your friends.
                    You can unsubscribe at any time.
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleRemovePushSubscription}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                    ) : null}
                    Unubscribe
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="warning" className="max-w-xl">
              <AlertTitle className="font-bold">
                <div className="flex flex-row gap-1 items-center">
                  <TriangleAlert className="h-4 w-4 text-yellow-700" />
                  <div className="font-bold">Heads Up!</div>
                </div>
              </AlertTitle>
              <AlertDescription>
                <div className="flex flex-col md:flex-row gap-5">
                  <p>
                    This device is not subscribed to notifications. Enable them
                    to stay in touch with your groups and get reminders.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={handleAddPushSubscription}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                    ) : null}{" "}
                    Subscribe
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
