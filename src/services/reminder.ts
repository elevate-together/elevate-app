"use server";

import db from "@/lib/db";
import { Reminder, ZoneType } from "@prisma/client";

export async function addReminder({
  userId,
  title,
  message,
  frequency,
  time,
  timeZone,
  dayOfWeek,
}: {
  userId: string;
  title: string;
  message: string;
  frequency: string;
  time: string;
  timeZone: ZoneType;
  dayOfWeek?: string;
}): Promise<{
  success: boolean;
  message: string;
  reminder: Reminder | null;
}> {
  try {
    console.log(time);

    const reminder = await db.reminder.create({
      data: {
        userId,
        title,
        message,
        frequency,
        time,
        timeZone,
        dayOfWeek:
          frequency === "weekly" && dayOfWeek ? parseInt(dayOfWeek) : null,
      },
    });

    return {
      success: true,
      message: "Reminder added successfully",
      reminder,
    };
  } catch (error) {
    console.error("Failed to add reminder:", error);
    return {
      success: false,
      message: "Could not add reminder",
      reminder: null,
    };
  }
}

export async function getRemindersByUserId({
  userId,
}: {
  userId: string;
}): Promise<{
  success: boolean;
  message: string;
  reminders: Reminder[];
}> {
  try {
    const reminders = await db.reminder.findMany({
      where: {
        userId,
      },
      orderBy: {
        time: "asc",
      },
    });

    return {
      success: true,
      message: "Reminders retrieved successfully",
      reminders,
    };
  } catch (error) {
    console.error("Failed to retrieve reminders:", error);
    return {
      success: false,
      message: "Could not retrieve reminders",
      reminders: [],
    };
  }
}
