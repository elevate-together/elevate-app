"use client";

import { Button } from "../../ui/button";
import { deleteUser } from "@/services/users";
import { toast } from "sonner";
import type { User } from "@/lib/definition";
import { useRouter } from "next/navigation";
import { Trash, Pencil } from "lucide-react";
import { useState } from "react";
import UserForm from "./user-form";

export default function UserProfile(user: User) {
  // Directly receive the full user object
  const [userData, setUserData] = useState<User>(user); // Manage the state with the user object
  const router = useRouter();
  const [isEdit, setIsEdit] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteUser(id);
      if (result.success) {
        router.push("/");
        toast.success("User deleted successfully");
      } else {
        toast.error(result.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("An error occurred while deleting the user");
    }
  };

  // Handle form submit from UserForm and update user state
  const handleUserSubmit = (updatedUser: User) => {
    setUserData(updatedUser);
    setIsEdit(false);
    toast.success("User updated successfully!");
  };

  // Handle form submit from UserForm and update user state
  const handleCancel = () => {
    setIsEdit(false);
  };

  return (
    <div key={user.id} className="flex flex-col items-left p-4 gap-3">
      <div className="flex flex-row gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsEdit(!isEdit)}
        >
          <Pencil />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => handleDelete(user.id)}
        >
          <Trash />
        </Button>
      </div>

      {isEdit ? (
        <UserForm
          user={userData}
          onSubmit={handleUserSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <div>
          <h2 className="text-lg font-semibold">{userData.name}</h2>
          {/* <p className="text-sm text-gray-500">ID: {userData.id}</p> */}
          <p className="text-gray-700">Email: {userData.email}</p>
        </div>
      )}
    </div>
  );
}
