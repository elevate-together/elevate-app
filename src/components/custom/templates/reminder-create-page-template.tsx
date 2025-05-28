"use client";

import { Reminder } from "@prisma/client";
import ReminderAdd from "../reminder/handlers/reminder-add";
import { getLocalTimeAndMeridiem } from "@/lib/utils";

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
              const initial = getLocalTimeAndMeridiem(reminder.time, -5);

              return (
                <li key={reminder.id} style={{ marginBottom: "1rem" }}>
                  <strong>{reminder.title}</strong> — {reminder.message} <br />
                  Frequency: {reminder.frequency} <br />
                  Time: {initial.time} {initial.meridiem} <br />
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
