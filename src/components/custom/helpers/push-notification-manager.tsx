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
  hideSubscribed = false,
  className = "",
}: {
  userId: string;
  refreshTrigger?: number;
  hideSubscribed?: boolean;
  className?: string;
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
        await checkSubscription();
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

      const exists = await checkIfDeviceExists(endpoint);

      if (!exists) {
        await subscription.unsubscribe();
      }

      setIsSubscribed(exists);
    } catch {
      toast.error("Error checking subscription:");
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
    } catch {
      toast.error("Error requesting permission for notifications:");
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

      const registration = await navigator.serviceWorker.register("/sw.js");
      if (!registration) return;

      const existingSubscription =
        await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setIsSubscribed(true);
        return;
      }

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

      const { success, message } = await subscribeDevice({
        sub: subscriptionData,
        userId,
      });

      if (success) {
        setIsSubscribed(true);
        router.refresh();
      } else {
        toast.error(message);
      }
    } catch {
      toast.error("Error Adding Device to Account. Try Again");

      if (sub) {
        try {
          await sub.unsubscribe();
        } catch {
          toast.error("Error unsubscribing device:");
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
          const { success: successUnsubscribe } = await unsubscribeDevice({
            userId,
            endpoint: subscription.endpoint,
          });
          if (successUnsubscribe) {
            setIsSubscribed(false);
            router.refresh();
          } else {
            toast.error("Failed to unsubscribe from push notifications");
          }
        } else {
          toast.error("Failed to unsubscribe from push notifications");
        }
      }
    } catch {
      toast.error("Error unsubscribing:");
    } finally {
      setIsLoading(false);
    }
  };

  if (isStartLoading) {
    return null;
  }

  return (
    <div>
      {!supportsNotifications ? (
        <div className={`flex justify-center ${className}`}>
          <Alert variant="destructive" className="w-full">
            <AlertDescription className="flex flex-row items-center gap-3">
              <TriangleAlert className="h-4 w-4 text-red-500" />
              <div>
                Push notifications are not supported in this browser. If
                you&apos;re on mobile, make sure you&apos;ve added Elevate to
                your homescreen first.
              </div>
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className="flex justify-center">
          {isSubscribed ? (
            !hideSubscribed ? (
              <div className={className}>
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
                          "Unsubscribe"
                        )}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            ) : null
          ) : (
            <div className={className}>
              <Alert variant="warning">
                <AlertDescription>
                  <div className="flex flex-col gap-2 sm:items-center justify-between md:flex-row">
                    <div>
                      <div className="flex flex-row gap-2 items-center">
                        <TriangleAlert className="h-4 w-4 text-yellow-700" />
                        <div className="font-bold">Heads Up!</div>
                      </div>

                      <div className="ml-6">
                        Your device is not subscribed to notifications yet.
                        Enable them to get updates and stay connected with your
                        groups.
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
