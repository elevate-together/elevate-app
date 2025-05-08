// app/api/send-reminders/route.ts
import { NextResponse } from "next/server";
import webpush from "web-push";
// import { format } from "date-fns";
import db from "@/lib/db";

webpush.setVapidDetails(
  "mailto:hebeforeme3@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  //   const now = new Date();
  //   const timeStr = format(now, "HH:mm");
  //   const dayOfWeek = now.getDay();

  //   const startOfHour = new Date(now);
  //   startOfHour.setMinutes(0, 0, 0);

  //   const endOfHour = new Date(now);
  //   endOfHour.setMinutes(59, 59, 999);

  //   const startOfHourStr = format(startOfHour, "HH:mm");
  //   const endOfHourStr = format(endOfHour, "HH:mm");

  try {
    const reminders = await db.reminder.findMany({
      where: {
        OR: [
          {
            frequency: "daily",
            // time: {
            //   gte: startOfHourStr,
            //   lte: endOfHourStr,
            // },
          },
          {
            frequency: "weekly",
            // time: timeStr,
            // dayOfWeek: dayOfWeek,
          },
        ],
      },
      include: {
        user: {
          include: {
            devices: true,
          },
        },
      },
    });

    let notificationsSent = 0;

    for (const reminder of reminders) {
      const { user } = reminder;

      for (const device of user.devices) {
        try {
          await webpush.sendNotification(
            {
              endpoint: device.endpoint,
              keys: {
                p256dh: device.p256dh,
                auth: device.auth,
              },
            },
            JSON.stringify({
              title: reminder.title,
              body: reminder.message,
            })
          );

          notificationsSent++;
        } catch {
          console.log("Failed to send notification to device ${device.id}:");
        }
      }
    }
    return NextResponse.json({
      success: true,
      message: `Sent ${notificationsSent} notifications.`,
    });
  } catch (error) {
    console.error("Error sending reminders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send reminders." },
      { status: 500 }
    );
  }
}
