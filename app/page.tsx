import { auth } from "@auth"; // import PushNotificationManager from "@components/custom/PushNotificationManager";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  return (
    <div>
      {/* <PushNotificationManager userId={session?.user?.id || ""} /> */}
      <div>
        Welcome, {session?.user?.name} {userId}
      </div>
    </div>
  );
}
