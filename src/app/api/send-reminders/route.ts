import { NextResponse } from "next/server";
import { format } from "date-fns";
import prisma from "@/lib/prisma";
import { sendNotificationAllDevices } from "@/services/device";
import { NotificationType, ReminderFrequency } from "@prisma/client";

export async function GET() {
  const now = new Date();
  const currentUtcTime = format(now, "HH:mm");
  const currentDayOfWeek = now.getUTCDay(); // Sunday = 0

  try {
    const reminders = await prisma.reminder.findMany({
      where: {
        OR: [
          {
            frequency: ReminderFrequency.DAILY,
            time: currentUtcTime,
          },
          {
            frequency: ReminderFrequency.WEEKLY,
            time: currentUtcTime,
            dayOfWeek: currentDayOfWeek,
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    await Promise.all(
      reminders.map((reminder) =>
        sendNotificationAllDevices({
          userId: reminder.user.id,
          message: reminder.message,
          notificationType: NotificationType.TESTPUSH,
          notificationLink: `reminder/${reminder.user.id}`,
          title: reminder.title,
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Sent ${reminders.length} notifications at ${currentUtcTime}`,
    });
  } catch (error) {
    console.error("Error sending reminders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send reminders." },
      { status: 500 }
    );
  }
}
