"use server";

import db from "@/lib/db";
import { PrayerGroup, User } from "@prisma/client";

type ResponseMessage = {
  success: boolean;
  message: string;
};

// ADD a User to a Prayer Group
export async function addUserToPrayerGroup(
  userId: string,
  groupId: string
): Promise<ResponseMessage> {
  try {
    // Check if the user is already part of the prayer group
    const existingMembership = await db.userPrayerGroup.findUnique({
      where: {
        userId_prayerGroupId: {
          userId,
          prayerGroupId: groupId,
        },
      },
    });

    if (existingMembership) {
      return {
        success: false,
        message: "User is already part of this prayer group.",
      };
    }

    // Add user to prayer group
    await db.userPrayerGroup.create({
      data: {
        userId,
        prayerGroupId: groupId,
      },
    });

    return {
      success: true,
      message: "User successfully added to the prayer group.",
    };
  } catch (error) {
    console.error("Error adding user to prayer group:", error);
    return {
      success: false,
      message: "An error occurred while adding the user to the prayer group.",
    };
  }
}

// REMOVE a User from a Prayer Group
export async function removeUserFromPrayerGroup(
  userId: string,
  groupId: string
): Promise<ResponseMessage> {
  try {
    // Check if the user is in the prayer group
    const userPrayerGroup = await db.userPrayerGroup.findUnique({
      where: {
        userId_prayerGroupId: {
          userId,
          prayerGroupId: groupId,
        },
      },
    });

    if (!userPrayerGroup) {
      return {
        success: false,
        message: "User is not part of this prayer group.",
      };
    }

    // Remove user from prayer group
    await db.userPrayerGroup.delete({
      where: {
        userId_prayerGroupId: {
          userId,
          prayerGroupId: groupId,
        },
      },
    });

    return {
      success: true,
      message: "User successfully removed from the prayer group.",
    };
  } catch (error) {
    console.error("Error removing user from prayer group:", error);
    return {
      success: false,
      message:
        "An error occurred while removing the user from the prayer group.",
    };
  }
}

// GET all users in a specific prayer group
export async function getUsersInPrayerGroup(groupId: string): Promise<{
  success: boolean;
  message: string;
  users?: User[];
}> {
  try {
    // Fetch all the users associated with the given prayer group
    const usersInGroup = await db.userPrayerGroup.findMany({
      where: {
        prayerGroupId: groupId,
      },
      include: {
        user: true,
      },
    });

    if (usersInGroup.length === 0) {
      return {
        success: false,
        message: "No users found in this prayer group.",
      };
    }

    // Map to return only the user data, as `userPrayerGroup` contains references to both
    const users = usersInGroup.map((userPrayerGroup) => userPrayerGroup.user);

    return {
      success: true,
      message: "Successfully fetched all users in the prayer group.",
      users,
    };
  } catch (error) {
    console.error("Error fetching users in prayer group:", error);
    return {
      success: false,
      message: "An error occurred while fetching users in the prayer group.",
    };
  }
}

export async function getPrayerGroupsNotIn(userId: string): Promise<{
  success: boolean;
  message: string;
  prayerGroups?: (PrayerGroup & { owner: User })[]; // Include owner in the return type
}> {
  try {
    const prayerGroups = await db.prayerGroup.findMany({
      where: {
        users: {
          every: {
            userId: {
              not: userId, // Ensures the prayer group does not have the user
            },
          },
        },
      },
      include: {
        owner: true, // Include the related owner user object
      },
    });

    return {
      success: true,
      message:
        "Successfully fetched prayer groups not associated with the user",
      prayerGroups, // Now includes the 'owner' field in each prayer group
    };
  } catch (error: unknown) {
    console.error("Error fetching prayer groups:", error);
    return {
      success: false,
      message: "Error fetching prayer groups",
    };
  }
}

export async function getPrayerGroupsForUser(userId: string): Promise<{
  success: boolean;
  message: string;
  prayerGroups?: (PrayerGroup & { owner: User })[]; // Include owner in the return type
}> {
  try {
    const prayerGroups = await db.prayerGroup.findMany({
      where: {
        users: {
          some: {
            userId: userId, // Ensures the user is part of the prayer group
          },
        },
      },
      include: {
        owner: true, // Include the related owner user object
      },
    });

    return {
      success: true,
      message: "Successfully fetched prayer groups the user is part of",
      prayerGroups,
    };
  } catch (error: unknown) {
    console.error("Error fetching prayer groups for the user:", error);
    return {
      success: false,
      message: "Error fetching prayer groups for the user",
    };
  }
}
