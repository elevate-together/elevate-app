import { auth } from "@/auth";
import SignIn from "@/components/custom/functions/sign-in";
import SignOut from "@/components/custom/functions/sign-out";
import { ThemeSwitch } from "@/components/custom/functions/theme-switch";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default async function Navbar() {
  const session = await auth();
  return (
    <div className="flex flex-row justify-between w-full p-2">
      <div className="flex flex-row justify-start">
        <SidebarTrigger />
        <ThemeSwitch />
      </div>

      {session && session.user?.id ? (
        <div className="flex flex-row gap-4">
          <SignOut hideOnMobile />
        </div>
      ) : (
        <div>
          <SignIn className="max-w-25" />
        </div>
      )}
    </div>
  );
}
