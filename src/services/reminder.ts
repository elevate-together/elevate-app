"use server";

import prisma from "@/lib/prisma";
import { Reminder, ReminderFrequency, ZoneType } from "@prisma/client";

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
  frequency: ReminderFrequency;
  time: string;
  timeZone: ZoneType;
  dayOfWeek?: string;
}): Promise<{
  success: boolean;
  message: string;
  reminder: Reminder | null;
}> {
  try {
    const reminder = await prisma.reminder.create({
      data: {
        userId,
        title,
        message,
        frequency,
        time,
        timeZone,
        dayOfWeek:
          frequency === ReminderFrequency.WEEKLY && dayOfWeek
            ? parseInt(dayOfWeek)
            : null,
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
    const reminders = await prisma.reminder.findMany({
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

export async function deleteReminder({
  reminderId,
  userId,
}: {
  reminderId: string;
  userId: string;
}): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await prisma.reminder.delete({
      where: {
        id: reminderId,
        userId,
      },
    });

    return {
      success: true,
      message: "Reminder deleted successfully",
    };
  } catch (error) {
    console.error("Failed to delete reminder:", error);
    return {
      success: false,
      message: "Could not delete reminder",
    };
  }
}

export async function updateReminder({
  reminderId,
  userId,
  title,
  message,
  frequency,
  time,
  timeZone,
  dayOfWeek,
}: {
  reminderId: string;
  userId: string;
  title: string;
  message: string;
  frequency: ReminderFrequency;
  time: string;
  timeZone: ZoneType;
  dayOfWeek?: string;
}): Promise<{
  success: boolean;
  message: string;
  reminder: Reminder | null;
}> {
  try {
    const reminder = await prisma.reminder.update({
      where: {
        id: reminderId,
        userId,
      },
      data: {
        title,
        message,
        frequency,
        time,
        timeZone,
        dayOfWeek:
          frequency === ReminderFrequency.WEEKLY && dayOfWeek
            ? parseInt(dayOfWeek)
            : null,
      },
    });

    return {
      success: true,
      message: "Reminder updated successfully",
      reminder,
    };
  } catch (error) {
    console.error("Failed to update reminder:", error);
    return {
      success: false,
      message: "Could not update reminder",
      reminder: null,
    };
  }
}
