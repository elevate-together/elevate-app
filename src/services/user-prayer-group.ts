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
        message: "You are already a part of this prayer group.",
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
      message: "You have successfully joined the prayer group.",
    };
  } catch (error) {
    console.error("Error adding user to prayer group:", error);
    return {
      success: false,
      message:
        "An issue occurred while trying to add you to the prayer group. Please try again.",
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
        message: "You are not a part of this prayer group.",
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
      message: "You have been successfully removed from the prayer group.",
    };
  } catch (error) {
    console.error("Error removing user from prayer group:", error);
    return {
      success: false,
      message:
        "An issue occurred while trying to remove you from the prayer group. Please try again.",
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
        message: "No members are currently part of this prayer group.",
      };
    }

    // Map to return only the user data, as `userPrayerGroup` contains references to both
    const users = usersInGroup.map((userPrayerGroup) => userPrayerGroup.user);

    return {
      success: true,
      message: "Members retrieved successfully.",
      users,
    };
  } catch (error) {
    console.error("Error fetching users in prayer group:", error);
    return {
      success: false,
      message: "Could not retrieve group members. Please try again.",
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
        "Prayer groups you are not part of have been retrieved successfully.",
      prayerGroups, // Now includes the 'owner' field in each prayer group
    };
  } catch (error: unknown) {
    console.error("Error fetching prayer groups:", error);
    return {
      success: false,
      message: "An error occurred while fetching the prayer groups.",
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
      message:
        "Prayer groups you are part of have been retrieved successfully.",
      prayerGroups,
    };
  } catch (error: unknown) {
    console.error("Error fetching prayer groups for the user:", error);
    return {
      success: false,
      message:
        "An error occurred while fetching the prayer groups you're part of.",
    };
  }
}
