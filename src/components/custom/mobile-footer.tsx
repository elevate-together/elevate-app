import { auth } from "@/auth";
import ClientMobileFooter from "./client-mobile-footer";

export default async function MobileFooter() {
  const session = await auth();

  let isStandAlone =
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches;

  if (!session || !session?.user?.id) {
    return null;
  }

  isStandAlone = true;

  if (!isStandAlone) {
    return null;
  }
  return <ClientMobileFooter id={session.user?.id} />;
}
