import { auth } from "@/auth";

import { Home, Users, HelpingHandIcon } from "lucide-react"; // Import Lucide icons
import Link from "next/link";

export default async function MobileFooter() {
  const session = await auth();

  if (!session) {
    return null;
  }
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white text-primary p-3 flex justify-around items-center border block md:hidden pb-6">
      <Link href="/groups" className="flex flex-col items-center">
        <Users />
        <span className="text-sm">Groups</span>
      </Link>
      <Link href="/" className="flex flex-col items-center">
        <Home />
        <span className="text-sm">Home</span>
      </Link>
      <Link href="/" className="flex flex-col items-center">
        <HelpingHandIcon />
        <span className="text-sm">Prayers</span>
      </Link>
    </footer>
  );
}
