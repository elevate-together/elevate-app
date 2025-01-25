import UserProfile from "@/components/custom/user/user-profile";
import { getUserById } from "@/services/users";

export default async function Profile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await getUserById((await params).id);
  return (
    <div className="p-2">
      {user ? <UserProfile {...user} /> : <p>User not found</p>}
    </div>
  );
}
