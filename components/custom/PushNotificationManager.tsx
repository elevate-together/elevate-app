"use client";
import React, { useState, useEffect } from "react";
import { subscribeUser, unsubscribeUser } from "@app/actions";
import { urlBase64ToUint8Array } from "@utils/vapid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { TriangleAlert, Loader } from "lucide-react";
import { Button } from "@components/ui/button";

function PushNotificationManager({ userId }: { userId: string }) {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  // const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  // Function to collect device info
  function getDeviceInfo() {
    return {
      platform: navigator.platform,
      osVersion: navigator.userAgent, // You can refine this to extract a more specific OS version if needed
      userAgent: navigator.userAgent,
    };
  }

  async function subscribeToPush() {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });
      setSubscription(sub);
      const deviceInfo = getDeviceInfo();

      const subscriptionData = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(sub.getKey("p256dh")),
          auth: arrayBufferToBase64(sub.getKey("auth")),
        },
      };

      await subscribeUser(subscriptionData, userId, deviceInfo);
      toast.success(`Device Added to Account`);
    } catch (error) {
      toast.error(`Error Adding Device to Account. Try Again`);
      console.error("Error subscribing to push notifications", error);
    } finally {
      setIsLoading(false);
    }
  }

  function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return "";
    const uint8Array = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return window.btoa(binary); // Convert to base64 string
  }

  async function unsubscribeFromPush() {
    setIsLoading(true);
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        await unsubscribeUser(userId);
        toast.success(`Device Removed From Account`);
      }
    } catch (error) {
      console.error("Error unsubscribing from push notifications", error);
    } finally {
      setIsLoading(false);
    }
  }

  // async function sendTestNotification() {
  //   setIsLoading(true);
  //   try {
  //     if (subscription) {
  //       await sendNotification(userId, message);
  //       setMessage("");
  //     }
  //   } catch (error) {
  //     console.error("Error sending test notification", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  if (!isSupported) {
    return (
      <div className="flex justify-center m-4">
        <Alert variant="destructive" className="max-w-lg">
          <TriangleAlert className="h-4 w-4" color="#A15027" />
          <AlertDescription>
            <div className="flex flex-col md:flex-row gap-5">
              <p>
                Push notifications are not supported in this browser. Make sure
                that your phone is up to date.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex justify-center m-4">
      {subscription ? (
        <div>
          <Alert variant="success" className="max-w-lg">
            <TriangleAlert className="h-4 w-4" color="#16A34A" />
            <AlertTitle className="font-bold">
              You’re subscribed to notifications!
            </AlertTitle>
            <AlertDescription>
              <div className="flex flex-col md:flex-row gap-5">
                <div>
                  Elevate uses notifications to connect you with your friends.
                  You can unsubscribe at any time.
                </div>
                <Button
                  variant="secondary"
                  onClick={unsubscribeFromPush}
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
        </div>
      ) : (
        <Alert variant="warning" className="max-w-lg">
          <TriangleAlert className="h-4 w-4" color="#A15027" />
          <AlertTitle className="font-bold">Heads up!</AlertTitle>
          <AlertDescription>
            <div className="flex flex-col md:flex-row gap-5">
              <div>
                You’re not subscribed to notifications. Enable them to stay in
                touch with your groups and get reminders.
              </div>
              <Button
                variant="secondary"
                onClick={subscribeToPush}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                ) : null}
                Subscribe
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default PushNotificationManager;
