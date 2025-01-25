"use client";

import UserProfile from "@/components/custom/user-profile";
import users from "@/lib/placeholder-data";
import { useParams } from "next/navigation";

export default function Profile() {
  const params = useParams();
  const id = params.id;

  const user = users.find((user) => user.id === id);

  return (
    <div className="p-2">
      <h2 className="col-span-full text-lg font-semibold">Your Info</h2>
      {user ? <UserProfile {...user} /> : <p>User not found</p>}
    </div>
  );
}
