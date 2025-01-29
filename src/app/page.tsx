import { auth } from "@/auth";
import { getUserById } from "@/services/users";

export default async function Home() {
  const session = await auth();
  const { id } = { ...session?.user };

  let user = null;

  if (id) {
    const response = await getUserById(id);
    user = response.user;
  }

  return (
    <div>
      {user ? (
        <h1 className="text-xl font-bold">{`Welcome ${user.name}`}</h1>
      ) : (
        <h1 className="text-xl font-bold">Welcome to Elevate</h1>
      )}
    </div>
  );
}
