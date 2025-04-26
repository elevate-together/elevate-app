import { auth } from "@/auth";
import { Separator } from "../ui/separator";
import ClientNavbarUser from "./client-navbar-user";
import { getNotificationCountForUser } from "@/services/notification";

export default async function Navbar() {
  const session = await auth();

  if (!session?.user) return null;

  if (!session?.user?.id) return null;

  const data = await getNotificationCountForUser(session.user.id);

  return (
    <div className="block shadow-sm z-10 md:hidden">
      <ClientNavbarUser
        id={session.user.id}
        image={session.user.image}
        name={session.user.name}
        notificationCount={data.count}
      />
      <Separator />
    </div>
  );
}
