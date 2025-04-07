"use server";

import db from "@/lib/db";
import { ResponseMessage } from "@/lib/utils";
import { PrayerGroup, User } from "@prisma/client";

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
  prayerGroups?: (PrayerGroup & {
    owner: User;
    memberCount: number;
    users?: Pick<User, "name">[]; // Add the users with selected fields
  })[];
}> {
  try {
    // Fetch the prayer groups where the user is not part of the group
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
        users: {
          select: {
            user: {
              // Use `user` field from the `UserPrayerGroup` relation
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Add member count to each prayer group and include the selected user fields
    const prayerGroupsWithMemberCount = prayerGroups.map((prayerGroup) => {
      const memberCount = prayerGroup.users?.length || 0;
      // Extracting only the user details from the `UserPrayerGroup` relation
      const users = prayerGroup.users?.map(
        (userPrayerGroup) => userPrayerGroup.user
      );

      return {
        ...prayerGroup,
        memberCount, // Add member count to each prayer group
        users, // Attach the selected user fields
      };
    });

    return {
      success: true,
      message:
        "Prayer groups you are not part of have been retrieved successfully.",
      prayerGroups: prayerGroupsWithMemberCount, // Return the updated prayer groups with member counts and selected user fields
    };
  } catch (error: unknown) {
    console.error("Error fetching prayer groups:", error);
    return {
      success: false,
      message: "An error occurred while fetching the prayer groups.",
    };
  }
}

export async function getUsersByPrayerGroup(groupId: string): Promise<{
  success: boolean;
  message: string;
  users?: Pick<User, "id" | "name" | "email" | "image" | "createdAt">[];
}> {
  try {
    const userPrayerGroups = await db.userPrayerGroup.findMany({
      where: { prayerGroupId: groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
      },
    });

    if (!userPrayerGroups.length) {
      return {
        success: false,
        message: "No users found in this prayer group.",
      };
    }

    return {
      success: true,
      message: "Users retrieved successfully.",
      users: userPrayerGroups.map((entry) => entry.user),
    };
  } catch (error) {
    console.error("Error fetching users for prayer group:", error);
    return {
      success: false,
      message: "An error occurred while retrieving users.",
    };
  }
}

export async function getPrayerGroupsForUser(userId: string): Promise<{
  success: boolean;
  message: string;
  prayerGroups?: (PrayerGroup & { owner: User; memberCount: number })[]; // Include owner and memberCount in the return type
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
        users: true, // Include the users (members) of the prayer group to count them
      },
    });

    if (!prayerGroups || prayerGroups.length === 0) {
      return {
        success: false,
        message: "You are not part of any prayer groups.",
      };
    }

    // Add member count to each prayer group
    const prayerGroupsWithMemberCount = prayerGroups.map((prayerGroup) => {
      const memberCount = prayerGroup.users?.length || 0; // Calculate the member count
      return {
        ...prayerGroup,
        memberCount, // Add member count to the prayer group object
      };
    });

    return {
      success: true,
      message:
        "Prayer groups you are part of have been retrieved successfully.",
      prayerGroups: prayerGroupsWithMemberCount, // Return the updated prayer groups with member counts
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
