"use client";

import UserComponent from "@/components/custom/user/user-card";
import { getAllUsers } from "@/services/users";
import { User as UserDef } from "@prisma/client";
import { useEffect, useState } from "react";

export default function Home() {
  const [users, setUsers] = useState<UserDef[]>([]);

  // Fetch the users when the component mounts or updates
  useEffect(() => {
    const fetchUsers = async () => {
      const { users } = await getAllUsers();
      setUsers(users || []);
    };
    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen">
      {/* Grid of all users */}
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
        <h2 className="col-span-full text-lg font-semibold">All Users</h2>
        {users && users.length > 0 ? (
          users.map((user) => <UserComponent key={user.id} {...user} />)
        ) : (
          <div>No users found</div>
        )}
      </div>
    </div>
  );
}
