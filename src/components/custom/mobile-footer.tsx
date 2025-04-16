import { auth } from "@/auth";
import ClientMobileFooter from "./client-mobile-footer";

export default async function MobileFooter() {
  const session = await auth();

  const isStandAlone =
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches;

  if (!session || !session?.user?.id) {
    return null;
  }

  if (!isStandAlone) {
    return null;
  }
  return <ClientMobileFooter id={session.user?.id} />;
}
