'use server'

import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

let subscription: webpush.PushSubscription | null = null;

export async function subscribeUser(sub: {
  endpoint: string;
  keys: {
    p256dh: string;  
    auth: string;    
  };
  expirationTime?: number | null;
}) {
  if (!sub || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) {
    throw new Error('Invalid PushSubscription object: Missing keys');
  }

  subscription = {
    endpoint: sub.endpoint,
    expirationTime: sub.expirationTime,
    keys: {
      p256dh: sub.keys.p256dh, 
      auth: sub.keys.auth,     
    },
  } as webpush.PushSubscription;

  // TODO: Store subscription in the database or persist it in your production environment
  return { success: true };
}

export async function unsubscribeUser() {
  subscription = null;

  // TODO: Remove the subscription from the database or stop sending notifications in production
  return { success: true };
}

export async function sendNotification(message: string) {
  if (!subscription) {
    throw new Error('No subscription available');
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'Test Notification',
        body: message,
        icon: '/icon.png',
      })
    );
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}
