import { auth } from "@/auth";
import ClientMobileFooter from "@/components/custom/helpers/bars/footer/client-mobile-footer";

export default async function MobileFooter() {
  const session = await auth();

  if (!session || !session?.user?.id) {
    return null;
  }

  return <ClientMobileFooter userId={session.user?.id} />;
}
