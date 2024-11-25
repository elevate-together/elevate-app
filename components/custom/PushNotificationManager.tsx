import React, { useState, useEffect } from "react";
import { subscribeUser, unsubscribeUser, sendNotification } from "@app/actions";
import { urlBase64ToUint8Array } from "@utils/vapid";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { TriangleAlert, UserMinus, SendHorizonal } from "lucide-react";
import { Button } from "@components/ui/button";
function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
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

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
    setSubscription(sub);

    // Convert ArrayBuffer keys to base64-encoded strings
    const subscriptionData = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(sub.getKey("p256dh")), // Convert ArrayBuffer to base64
        auth: arrayBufferToBase64(sub.getKey("auth")), // Convert ArrayBuffer to base64
      },
    };

    // Send the plain object with base64-encoded keys to the server
    await subscribeUser(subscriptionData);
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
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
      await unsubscribeUser();
    }
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message);
      setMessage("");
    }
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <div className="flex justify-center mt-5">
      {subscription ? (
        <div>
          <Card className="max-w-md ">
            <CardHeader>
              <CardTitle>Push Notification</CardTitle>
              <CardDescription>
                This card is used for testing push notifications to ensure
                real-time alerts are functioning correctly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                required
                type="text"
                placeholder="Enter notification message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <div className="flex flex-col w-full gap-4">
                <Button className="w-full" onClick={sendTestNotification}>
                  <SendHorizonal /> Send Test
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={unsubscribeFromPush}
                >
                  <UserMinus /> Unsubscribe
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <>
          <Alert variant="warning" className="max-w-lg">
            <TriangleAlert className="h-4 w-4" color="#A15027" />
            <AlertTitle className="font-bold">Heads up!</AlertTitle>
            <AlertDescription>
              <div className="flex flex-col md: flex-row gap-5">
                <div>
                  You're not subscribed to notifications. Enable them to get
                  real-time alerts and never miss important updates.
                </div>
                <Button variant="secondary" onClick={subscribeToPush}>
                  Subscribe
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}

export default PushNotificationManager;
