import UserProfile from "@/components/custom/user-profile";
import users from "@/lib/placeholder-data";
import type { User } from "@/lib/definition";

export default function Profile({ params }: { params: { id: string } }) {
  const user: User | undefined = users.find((user) => user.id === params.id);

  return (
    <div className="items-center justify-items-center min-h-screen p-2 pb-20 gap-2 font-[family-name:var(--font-geist-sans)]">
      <main className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
        <h2 className="col-span-full text-lg font-semibold">Your Info</h2>
        {user && <UserProfile {...user} />}
      </main>
    </div>
  );
}
