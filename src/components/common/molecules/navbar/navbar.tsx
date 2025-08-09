import { auth } from "@/auth";
import { NavbarClient } from "@/components/common";
import { Separator } from "@/components/ui";
import { getNotificationCountForUser } from "@/services/notification";

export async function Navbar() {
  const session = await auth();

  if (!session) return null;

  const data = await getNotificationCountForUser({ userId: session.user.id });

  return (
    <div className="block shadow-sm z-10 md:hidden">
      <NavbarClient session={session} notificationCount={data.count || 0} />
      <Separator />
    </div>
  );
}
