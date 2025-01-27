"use client";

import { useEffect, useState } from "react";
import UserComponent from "@/components/custom/user/user-card";
import { getAllUsers } from "@/services/users";
import UserForm from "@/components/custom/user/user-form";
import { User as UserDef } from "@prisma/client";
import { toast } from "sonner";

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

  // Update the user list when a new user is added
  const onSubmit = (newUser: UserDef) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
    toast.success("User Created successfully!");
  };

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-2 pb-20 gap-4 font-[family-name:var(--font-geist-sans)]">
      {/* Form to add a new user */}
      <UserForm onSubmit={onSubmit} />

      {/* Grid of all users */}
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
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
