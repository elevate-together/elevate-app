import UserAvatar from "@/components/custom/user/user-avatar";
import { getUserById } from "@/services/users";

export default async function Profile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await getUserById((await params).id);

  if (!user) {
    return <div className="p-2">Unable to Find User</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* User Profile Section */}
      <UserAvatar
        name={user.name}
        image={user.image ?? undefined}
        email={user.email}
        size="large"
      />
    </div>
  );
}
