import { auth } from "@/auth";
import {
  PagePaddingWrapper,
  ProfileGuestPageTemplate,
  ProfileUserPageTemplate,
  SessionNotFound,
  UserNotFound,
} from "@/components/common";
import { getUserDevices } from "@/services/device";
import { getUserById } from "@/services/user";
import { toast } from "sonner";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id: pageId } = await params;
  const session = await auth();
  if (!session) {
    return <SessionNotFound />;
  }

  const isOwner = session.user.id === pageId;

  if (!isOwner) {
    const { user, message, success } = await getUserById({ id: pageId });

    if (!success) {
      toast.error(message);
    }

    if (!user) {
      return <UserNotFound />;
    }
    <ProfileGuestPageTemplate user={user} />;
  }

  const { devices } = await getUserDevices(pageId);

  return (
    <PagePaddingWrapper>
      <ProfileUserPageTemplate user={session.user} devices={devices ?? []} />
    </PagePaddingWrapper>
  );
}
