"use client";

import { Reminder } from "@prisma/client";
import ReminderAdd from "../reminder/handlers/reminder-add";
import {
  getLocalTimeAndMeridiemFromTimeZone,
  getMappedTimeZone,
} from "@/lib/utils";

type ReminderCreatePageTemplateProps = {
  userId: string;
  reminders: Reminder[];
};

export default function ReminderCreatePageTemplate({
  userId,
  reminders,
}: ReminderCreatePageTemplateProps) {
  return (
    <>
      <ReminderAdd userId={userId} />

      <div style={{ marginTop: "2rem" }}>
        <h2>Your Reminders</h2>
        {reminders.length === 0 ? (
          <p>No reminders found.</p>
        ) : (
          <ul>
            {reminders.map((reminder) => {
              const initial = getLocalTimeAndMeridiemFromTimeZone({
                utcTime: reminder.time,
                timeZone: getMappedTimeZone(reminder.timeZone),
              });

              return (
                <li key={reminder.id} style={{ marginBottom: "1rem" }}>
                  <strong>{reminder.title}</strong> — {reminder.message} <br />
                  Frequency: {reminder.frequency} <br />
                  Time: {initial.time} {initial.meridiem} <br />
                  TimeZone: {reminder.timeZone}
                  <br />
                  {reminder.frequency === "weekly" &&
                    reminder.dayOfWeek !== null && (
                      <>Day of week: {reminder.dayOfWeek}</>
                    )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
