"use server";

import db from "@/lib/db";
import { ResponseMessage } from "@/lib/utils";
import { Device, User } from "@prisma/client";

// GET All Users
export async function getAllUsers(): Promise<{
  success: boolean;
  message: string;
  users?: User[];
}> {
  try {
    const users = await db.user.findMany();
    return {
      success: true,
      message: "Successfully fetched all users",
      users,
    };
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      message: "Error fetching users",
    };
  }
}

// GET User by ID
export async function getUserById(id: string): Promise<{
  success: boolean;
  message: string;
  user?: User;
}> {
  try {
    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    return {
      success: true,
      message: "User found",
      user, // Single User type
    };
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    return {
      success: false,
      message: "Error fetching user by ID",
    };
  }
}

// CREATE a New User
export async function createUser(userData: {
  name: string;
  email: string;
  image?: string | null;
}): Promise<{
  success: boolean;
  message: string;
  user?: User;
}> {
  try {
    const newUser = await db.user.create({
      data: userData,
    });
    return {
      success: true,
      message: "Successfully created user",
      user: newUser,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      message: "Error creating user, try again.",
    };
  }
}

// UPDATE a User by ID
export async function updateUser(
  id: string,
  userData: { name?: string; email?: string; image?: string | null }
): Promise<{
  success: boolean;
  message: string;
  user?: User;
}> {
  try {
    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
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
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    return {
      success: false,
      message: "Error updating user",
    };
  }
}

// DELETE a User by ID
export async function deleteUser(id: string): Promise<ResponseMessage> {
  try {
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
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    return {
      success: false,
      message: "Error deleting user",
    };
  }
}

// GET device info for a user
export async function getUserDevices(userId: string): Promise<{
  success: boolean;
  message: string;
  devices?: Device[];
}> {
  try {
    // Fetch all devices associated with the user
    const devices = await db.device.findMany({
      where: { userId },
    });

    if (!devices || devices.length === 0) {
      return { success: false, message: "No devices found for the user" };
    }

    return {
      success: true,
      message: "Devices retrieved successfully",
      devices,
    };
  } catch (error) {
    console.error("Error fetching user devices:", error);
    return { success: false, message: "Failed to fetch devices" };
  }
}
