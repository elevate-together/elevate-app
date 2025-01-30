"use client";

import { deleteUser } from "@/services/users";
import { User } from "@prisma/client";
import { Pencil, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../ui/button";
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
  const handleUserSubmit = () => {
    setIsEdit(false);
    toast.success("User updated successfully!");
  };

  // Handle form submit from UserForm and update user state
  const handleCancel = () => {
    setIsEdit(false);
  };

  return (
    <div
      key={user.id}
      className="flex flex-row items-center justify-between gap-3"
    >
      {isEdit ? (
        <UserForm
          user={userData}
          onSubmit={handleUserSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <div>
          <h2 className="text-lg font-semibold">{userData.name}</h2>
          <p className="text-muted-foreground">Email: {userData.email}</p>
        </div>
      )}
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
    </div>
  );
}
