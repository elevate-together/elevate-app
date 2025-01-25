import users from "@/lib/placeholder-data";
import UserComponent from "@/components/custom/user-card";
import db from "@/lib/db";

export default function Home() {
  return (
    <div className="items-center justify-items-center min-h-screen p-2 pb-20 gap-2 font-[family-name:var(--font-geist-sans)]">
      <div className="text-green-500">{db && "Successfully connected to database"}</div>
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
        <h2 className="col-span-full text-lg font-semibold">All Users</h2>

        {users.map((user) => (
          <UserComponent key={user.id} {...user} />
        ))}
      </div>
    </div>
  );
}
