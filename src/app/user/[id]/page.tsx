import { auth } from "@/auth";
import UserProfileDevices from "@/components/custom/user/user-profile-devices";
import { Separator } from "@/components/ui/separator";
import { getUserById, getUserDevices } from "@/services/users";
export default async function Profile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const pageId = (await params).id;
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
    <div className="space-y-6">
      {isOwner ? (
        <UserProfileDevices devices={devices} user={pageUser} />
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {`${pageUser.name}'s Info`}
          </h2>
          <Separator className="my-4" />
          <div className="flex flex-col gap-4 md:flex-row md:gap-8 mx-4">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-semibold">Name:</div>
              <div>{pageUser.name}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-sm font-semibold">Email:</div>
              <div>{pageUser.email}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
