"use server";

import db from "@/lib/db";
import { Device, PrayerRequest, User } from "@prisma/client";

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
export async function deleteUser(
  id: string
): Promise<{ success: boolean; message: string }> {
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

export async function getFriendPrayerRequestsForUser(userId: string): Promise<{
  success: boolean;
  message: string;
  prayerRequests?: (PrayerRequest & { user: User })[];
}> {
  try {
    // Step 1: Get all prayer groups the user is part of
    const userPrayerGroups = await db.userPrayerGroup.findMany({
      where: { userId },
      include: {
        prayerGroup: {
          include: {
            users: true, // Get all users in the prayer group
          },
        },
      },
    });

    // Step 2: Collect all user IDs from the prayer groups the user is a member of
    const memberIds = userPrayerGroups.flatMap((userPrayerGroup) =>
      userPrayerGroup.prayerGroup.users.map((user) => user.userId)
    );

    // Step 3: Get all prayer requests from users in these groups (excluding the requesting user)
    const prayerRequests = await db.prayerRequest.findMany({
      where: {
        userId: { in: memberIds, not: userId }, // Exclude the requesting user
        status: "IN_PROGRESS",
      },
      include: {
        user: true, // Include user details with each prayer request
      },
    });

    return {
      success: true,
      message: prayerRequests.length
        ? "Successfully fetched friend prayer requests."
        : "No in-progress prayer requests found for friends.",
      prayerRequests,
    };
  } catch (error) {
    console.error("Error fetching friend prayer requests:", error);
    return {
      success: false,
      message: "Error fetching friend prayer requests.",
    };
  }
}
