"use client";

import { Reminder, User } from "@prisma/client";
import ReminderAdd from "../reminder/handlers/reminder-add";
import { convertUTCToZoneTime12hr } from "@/lib/utils";

type ReminderCreatePageTemplateProps = {
  user: User;
  reminders: Reminder[];
};

export default function ReminderCreatePageTemplate({
  user,
  reminders,
}: ReminderCreatePageTemplateProps) {
  return (
    <>
      <ReminderAdd user={user} />

      <div style={{ marginTop: "2rem" }}>
        <h2>Your Reminders</h2>
        {reminders.length === 0 ? (
          <p>No reminders found.</p>
        ) : (
          <ul>
            {reminders.map((reminder) => {
              const time = convertUTCToZoneTime12hr(
                reminder.time,
                user.timeZone || "CHICAGO"
              );

              return (
                <li key={reminder.id} style={{ marginBottom: "1rem" }}>
                  <strong>{reminder.title}</strong> — {reminder.message} <br />
                  Frequency: {reminder.frequency} <br />
                  Time: {time} <br />
                  TimeZone: {user.timeZone}
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
