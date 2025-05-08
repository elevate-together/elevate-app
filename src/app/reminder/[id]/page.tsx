import ReminderForm from "@/components/custom/reminder/reminder-form";

export default async function ReminderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: userId } = await params;

  return <ReminderForm userId={userId} />;
}
