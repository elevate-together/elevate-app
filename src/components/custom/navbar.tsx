import { auth } from "@/auth";
import SignIn from "@/components/custom/user/user-sign-in";
import SignOut from "@/components/custom/user/user-sign-out";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "../ui/separator";

export default async function Navbar() {
  const session = await auth();

  if (session == null) {
    return null;
  }

  return (
    <div className="block">
      <div className="flex md:flex bg-card flex-row justify-between w-full p-2">
        <div className="flex flex-row justify-start">
          <SidebarTrigger />
          {/* <ThemeSwitch /> */}
        </div>

        {session && session.user?.id ? (
          <div className="flex flex-row gap-4">
            <SignOut hideOnMobile variant="secondary" />
          </div>
        ) : (
          <div>
            <SignIn className="max-w-25" />
          </div>
        )}
      </div>
      <Separator />
    </div>
  );
}
