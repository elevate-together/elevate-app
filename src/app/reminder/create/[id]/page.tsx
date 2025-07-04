import PagePaddingWrapper from "@/components/custom/templates/helper/page-padding-wrapper";
import ReminderCreatePageTemplate from "@/components/custom/templates/reminder-create-page-template";
import UserNotFound from "@/components/not-found/user";
import { getRemindersByUserId } from "@/services/reminder";
import { getUserById } from "@/services/user";

export default async function ReminderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: userId } = await params;

  if (!userId) {
    return <div>Error finding user</div>;
  }
  const { user } = await getUserById({ id: userId });

  if (!user) {
    return <UserNotFound />;
  }
  const { reminders } = await getRemindersByUserId({ userId });

  return (
    <PagePaddingWrapper>
      <ReminderCreatePageTemplate user={user} reminders={reminders} />
    </PagePaddingWrapper>
  );
}
