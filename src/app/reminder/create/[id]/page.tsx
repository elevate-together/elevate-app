import ReminderCreatePageTemplate from "@/components/custom/templates/reminder-create-page-template";
import { getRemindersByUserId } from "@/services/reminder";

export default async function ReminderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: userId } = await params;
  const { reminders } = await getRemindersByUserId({ userId });

  return <ReminderCreatePageTemplate userId={userId} reminders={reminders} />;
}
