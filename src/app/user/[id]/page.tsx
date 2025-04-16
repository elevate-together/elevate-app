// app/(your-folder)/profile/[id]/page.tsx or similar

import { auth } from "@/auth";
import PagePaddingWrapper from "@/components/custom/templates/page-padding-wrapper";
import { ProfilePageTemplate } from "@/components/custom/templates/profile-page-template";
import { getUserById, getUserDevices } from "@/services/users";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: pageId } = await params;
  const { user: pageUser } = await getUserById(pageId);
  const { devices } = await getUserDevices(pageId);
  const session = await auth();

  if (!session) {
    return <div>You must be logged in to view this page.</div>;
  }

  const currUser = session.user;

  if (!currUser || !pageUser) {
    return <div className="p-2">Unable to Find User</div>;
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
