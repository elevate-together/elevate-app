"use client";
import { useSession } from "next-auth/react";
import PushNotificationManager from "@components/custom/PushNotificationManager";

export default function Page() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  console.log(session);

  return (
    <div>
      <PushNotificationManager userId={session?.user?.id || ""} />
    </div>
  );
}

// import { auth } from "../auth";

// export default async function Home() {
//   const session = await auth();
//   console.log(session);

//   if (!session?.user) return <div>Uh Oh, You are Currently Not Signed In</div>;

//   return (
//     <div>
//       <div>Welcome, {session.user.name}</div>
//       <div>You are Currently Signed In</div>
//     </div>
//   );
// }
