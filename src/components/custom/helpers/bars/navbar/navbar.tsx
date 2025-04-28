import { auth } from "@/auth";
import { Separator } from "@/components/ui/separator";
import { getNotificationCountForUser } from "@/services/notification";
import ClientNavbarUser from "@/components/custom/helpers/bars/navbar/client-navbar-user";
import SessionNotFound from "@/components/not-found/session";

export default async function Navbar() {
  const session = await auth();

  if (!session?.user?.id) return <SessionNotFound />;

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
