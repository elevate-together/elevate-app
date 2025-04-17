import { auth } from "@/auth";
import ClientMobileFooter from "./client-mobile-footer";

export default async function MobileFooter() {
  const session = await auth();

  if (!session || !session?.user?.id) {
    return null;
  }

  return <ClientMobileFooter id={session.user?.id} />;
}
