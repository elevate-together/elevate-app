import { auth } from "@/auth";
import {
  PagePaddingWrapper,
  ReminderPageTemplate,
  SessionNotFound,
} from "@/components/common";
import { getRemindersByUserId } from "@/services/reminder";

export default async function ReminderPage() {
  const session = await auth();

  if (!session) {
    return <SessionNotFound />;
  }
  const { reminders } = await getRemindersByUserId({ userId: session.user.id });

  return (
    <PagePaddingWrapper>
      <ReminderPageTemplate user={session.user} reminders={reminders} />
    </PagePaddingWrapper>
  );
}
