"use server";

import db from "@/lib/db";
import { ResponseMessage } from "@/lib/utils";
import { User, ZoneType } from "@prisma/client";
import { ObjectId } from "mongodb";

// GET User by ID
export async function getUserById({ id }: { id: string }): Promise<{
  success: boolean;
  message: string;
  user: User | null;
}> {
  try {
    if (!ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid ID format",
        user: null,
      };
    }

    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
        user: null,
      };
    }

    return {
      success: true,
      message: "User found",
      user,
    };
  } catch {
    return {
      success: false,
      message: "Error fetching user by ID",
      user: null,
    };
  }
}

// CREATE a New User
export async function createUser({
  name,
  email,
  image = null,
}: {
  name: string;
  email: string;
  image?: string | null;
}): Promise<{
  success: boolean;
  message: string;
  user: User | null;
}> {
  try {
    const newUser = await db.user.create({
      data: { name, email, image },
    });
    return {
      success: true,
      message: "Successfully created user",
      user: newUser,
    };
  } catch {
    return {
      success: false,
      message: "Error creating user, try again.",
      user: null,
    };
  }
}

// UPDATE a User by ID
export async function updateUser({
  id,
  userData,
}: {
  id: string;
  userData: { name?: string; email?: string; timeZone?: ZoneType };
}): Promise<{
  success: boolean;
  message: string;
  user: User | null;
}> {
  try {
    if (!ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid ID format",
        user: null,
      };
    }

    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
        user: null,
      };
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: userData,
    });

    return {
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    };
  } catch {
    return {
      success: false,
      message: "Error updating user, try again.",
      user: null,
    };
  }
}

// DELETE a User by ID
export async function deleteUser({
  id,
}: {
  id: string;
}): Promise<ResponseMessage> {
  try {
    if (!ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid ID format",
      };
    }

    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    await db.user.delete({
      where: { id },
    });

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch {
    return {
      success: false,
      message: "Error deleting user, try again.",
    };
  }
}
