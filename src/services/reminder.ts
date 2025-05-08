"use server";

import db from "@/lib/db";
import { Reminder } from "@prisma/client";
export async function addReminder({
  userId,
  title,
  message,
  frequency,
  time,
  dayOfWeek,
}: {
  userId: string;
  title: string;
  message: string;
  frequency: string;
  time: string;
  dayOfWeek?: string;
}): Promise<{
  success: boolean;
  message: string;
  reminder: Reminder | null;
}> {
  try {
    const reminder = await db.reminder.create({
      data: {
        userId,
        title,
        message,
        frequency,
        time,
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
