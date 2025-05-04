import { auth } from "@/auth";
import PagePaddingWrapper from "@/components/custom/templates/helper/page-padding-wrapper";
import { ProfilePageTemplate } from "@/components/custom/templates/helper/profile-page-template";
import UserNotFound from "@/components/not-found/user";
import { getUserDevices } from "@/services/device";
import { getUserById } from "@/services/user";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: pageId } = await params;
  const { user: pageUser } = await getUserById({ id: pageId });
  const { devices } = await getUserDevices(pageId);
  const session = await auth();

  if (!session) {
    return <div>You must be logged in to view this page.</div>;
  }

  const currUser = session.user;

  if (!currUser || !pageUser) {
    return <UserNotFound />;
  }

  const isOwner = currUser.id === pageId;

  return (
    <PagePaddingWrapper>
      <ProfilePageTemplate
        isOwner={isOwner}
        user={pageUser}
        devices={devices ?? []}
      />
    </PagePaddingWrapper>
  );
}
