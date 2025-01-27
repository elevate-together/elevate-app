import { auth } from "@/auth";
import { SignIn } from "@/components/custom/functions/sign-in";
import { SignOut } from "@/components/custom/functions/sign-out";
import { ThemeSwitch } from "@/components/custom/functions/theme-switch";
import PrayerGroupCreate from "@/components/custom/prayer-group/prayer-group-create";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default async function Navbar() {
  const session = await auth();
  return (
    <div className="flex flex-row justify-between w-full p-2">
      <div>
        <SidebarTrigger />
        <ThemeSwitch />
      </div>

      {session && session.user?.id ? (
        <div className="flex flex-row gap-4">
          <PrayerGroupCreate id={session.user.id} />
          <SignOut />
        </div>
      ) : (
        <SignIn className="max-w-25" />
      )}
    </div>
  );
}
