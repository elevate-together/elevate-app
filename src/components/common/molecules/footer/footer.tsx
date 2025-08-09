import { auth } from "@/auth";
import { FooterClient } from "@/components/common";

export async function Footer() {
  const session = await auth();

  if (!session) {
    return null;
  }

  return <FooterClient session={session} />;
}
