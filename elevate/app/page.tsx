import { auth } from "../auth";

export default async function Home() {
  const session = await auth();
  console.log(session);

  if (!session?.user) return <div>Uh Oh, You are Currently Not Signed In</div>;

  return (
    <div>
      <div>Welcome, {session.user.name}</div>
      <div>You are Currently Signed In</div>
    </div>
  );
}
