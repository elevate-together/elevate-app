import { auth } from "@/auth";
import { Separator } from "../ui/separator";
import ClientNavbarUser from "./client-navbar-user";

export default async function Navbar() {
  const session = await auth();

  if (!session?.user) return null;

  if (!session?.user?.id) return null;

  return (
    <div className="block shadow-sm z-10 md:hidden">
      <ClientNavbarUser
        navbarUser={{
          id: session.user.id,
          image: session.user.image,
          name: session.user.name,
        }}
      />
      <Separator />
    </div>
  );
}
