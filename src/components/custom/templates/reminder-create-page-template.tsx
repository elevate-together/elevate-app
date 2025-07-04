"use client";

import { Reminder, User } from "@prisma/client";
import ReminderAdd from "../reminder/handlers/reminder-add";
import { convertUTCToZoneTime12hr } from "@/lib/utils";
import NoDataDisplay from "./helper/no-data-display";
import { Badge } from "@/components/ui/badge";
import ReminderDelete from "../reminder/handlers/reminder-delete";
import ReminderEdit from "../reminder/handlers/reminder-edit";

type ReminderCreatePageTemplateProps = {
  user: User;
  reminders: Reminder[];
};

export default function ReminderCreatePageTemplate({
  user,
  reminders,
}: ReminderCreatePageTemplateProps) {
  return (
    <div className="flex flex-col min-h-full">
      {reminders.length === 0 ? (
        <NoDataDisplay
          title="You Don’t Have Any Reminders Yet"
          subtitle="It looks like you haven’t set up any reminders. Once you do, they’ll show up here."
          icon="CalendarDays"
          redirectButton={<ReminderAdd user={user} />}
        />
      ) : (
        <div className="space-y-3">
          <ReminderAdd user={user} className="w-full" />

          {reminders.map((reminder) => {
            const time = convertUTCToZoneTime12hr(reminder.time, user.timeZone);
            return (
              <div key={reminder.id} className="bg-white p-4 border rounded-lg">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-2 ">
                      <Badge
                        variant="outline"
                        className="text-xs lowercase capitalize"
                      >
                        {reminder.frequency.charAt(0).toUpperCase() +
                          reminder.frequency.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                    <div>
                      <ReminderDelete
                        reminderId={reminder.id}
                        userId={user.id}
                      />
                      <ReminderEdit reminder={reminder} user={user} icon />
                    </div>
                  </div>
                  <div className="text-lg font-bold"> {reminder.title}</div>
                </div>
                <div className="text-md space-y-2">
                  <p>{reminder.message}</p>
                  <div className="grid gap-1 ">
                    <p className="text-sm text-muted-foreground">
                      <strong> Reminder Time: </strong>
                      {time}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
