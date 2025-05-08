"use server";

import db from "@/lib/db";
import { MinimalUser, ResponseMessage } from "@/lib/utils";
import {
  GroupStatus,
  GroupType,
  NotificationType,
  PrayerGroup,
  PrayerRequestStatus,
  PrayerVisibility,
  ShareType,
  User,
} from "@prisma/client";
import { sendNotificationAllDevices } from "@/services/device";

// ADD a User to a Prayer Group
export async function addUserToPrayerGroup(
  userId: string,
  groupId: string
): Promise<ResponseMessage> {
  try {
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

    const prayerGroup = await db.prayerGroup.findUnique({
      where: {
        id: groupId,
      },
    });

    const status =
      prayerGroup?.groupType == GroupType.PUBLIC
        ? GroupStatus.ACCEPTED
        : GroupStatus.PENDING;

    // Add user to prayer group
    await db.userPrayerGroup.create({
      data: {
        userId,
        prayerGroupId: groupId,
        groupStatus: status,
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
  groupId: string,
  ownerId: string
): Promise<ResponseMessage> {
  try {
    if (userId === ownerId) {
      return {
        success: false,
        message:
          "The owner cannot be removed from the prayer group. Switch ownership before leaving the group.",
      };
    }

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

    const prayerRequestsToArchive = await db.prayerRequestShare.findMany({
      where: {
        sharedWithId: groupId,
        sharedWithType: ShareType.GROUP,
        ownerId: userId,
      },
    });

    const prayerRequestIds = prayerRequestsToArchive.map(
      (prayerRequestShare) => prayerRequestShare.prayerRequestId
    );

    await db.prayerRequest.updateMany({
      where: {
        id: {
          in: prayerRequestIds,
        },
      },
      data: {
        status: PrayerRequestStatus.ARCHIVED,
        visibility: PrayerVisibility.PRIVATE,
      },
    });

    await db.prayerRequestShare.deleteMany({
      where: {
        sharedWithId: groupId,
        sharedWithType: ShareType.GROUP,
        ownerId: userId,
      },
    });

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
    const usersInGroup = await db.userPrayerGroup.findMany({
      where: {
        prayerGroupId: groupId,
        groupStatus: GroupStatus.ACCEPTED,
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
    users: Pick<User, "name">[];
  })[];
}> {
  try {
    const userPrayerGroups = await db.userPrayerGroup.findMany({
      where: { userId },
      select: { prayerGroupId: true },
    });

    const joinedGroupIds = userPrayerGroups.map((upg) => upg.prayerGroupId);

    const prayerGroups = await db.prayerGroup.findMany({
      where: {
        id: { notIn: joinedGroupIds },
      },
      include: {
        owner: true,
        users: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const prayerGroupsWithMemberCount = prayerGroups.map((prayerGroup) => {
      const memberCount = prayerGroup.users?.length || 0;
      const users = prayerGroup.users?.map(
        (userPrayerGroup) => userPrayerGroup.user
      );
      return {
        ...prayerGroup,
        memberCount,
        users,
      };
    });

    return {
      success: true,
      message:
        "Prayer groups you are not part of have been retrieved successfully.",
      prayerGroups: prayerGroupsWithMemberCount,
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
  users?: MinimalUser[];
}> {
  try {
    const userPrayerGroups = await db.userPrayerGroup.findMany({
      where: { prayerGroupId: groupId, groupStatus: GroupStatus.ACCEPTED },
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

export async function getPendingUsersByPrayerGroup(groupId: string): Promise<{
  success: boolean;
  message: string;
  users?: User[];
}> {
  try {
    const userPrayerGroups = await db.userPrayerGroup.findMany({
      where: { prayerGroupId: groupId, groupStatus: GroupStatus.PENDING },
      include: {
        user: true,
      },
    });

    if (!userPrayerGroups.length) {
      return {
        success: false,
        message: "No pending users found in this prayer group.",
      };
    }

    return {
      success: true,
      message: "Users retrieved successfully.",
      users: userPrayerGroups.map((entry) => entry.user),
    };
  } catch (error) {
    console.error("Error fetching pending users for prayer group:", error);
    return {
      success: false,
      message: "An error occurred while retrieving pending users.",
    };
  }
}

export async function getPrayerGroupsForUser(userId: string): Promise<{
  success: boolean;
  message: string;
  prayerGroups?: PrayerGroup[];
}> {
  try {
    const userPrayerGroups = await db.userPrayerGroup.findMany({
      where: {
        userId: userId,
        groupStatus: GroupStatus.ACCEPTED,
      },
      include: {
        prayerGroup: {},
      },
    });

    if (!userPrayerGroups || userPrayerGroups.length === 0) {
      return {
        success: false,
        message:
          "You are not part of any prayer groups with an accepted status.",
      };
    }

    const prayerGroups = userPrayerGroups.map(
      (userPrayerGroup) => userPrayerGroup.prayerGroup
    );

    return {
      success: true,
      message:
        "Prayer groups you are part of with accepted status have been retrieved successfully.",
      prayerGroups: prayerGroups,
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

export async function acceptUserPrayerGroupStatus(
  userId: string,
  groupId: string,
  groupName?: string
): Promise<ResponseMessage> {
  try {
    await db.userPrayerGroup.update({
      where: {
        userId_prayerGroupId: {
          userId,
          prayerGroupId: groupId,
        },
      },
      data: {
        groupStatus: GroupStatus.ACCEPTED,
      },
    });

    await sendNotificationAllDevices({
      userId,
      message: groupName
        ? `You're now a part of the group ${groupName}. Start sharing prayer requests and praying for others in the group!`
        : `You're now a part of a new group! Start sharing prayer requests and praying for others as you grow together.`,
      notificationType: NotificationType.JOINEDGROUP,
      notificationLink: `/group/${groupId}`,
      title: groupName
        ? `You've been added to ${groupName}`
        : "You've been added to a new group",
    });

    return {
      success: true,
      message: `Accepted User.`,
    };
  } catch (error) {
    console.error("Error updating user group status:", error);
    return {
      success: false,
      message:
        "There was an error updating the user's status in the prayer group. Please try again.",
    };
  }
}

export async function getPrayerGroupsPendingForUser(userId: string): Promise<{
  success: boolean;
  message: string;
  prayerGroups?: PrayerGroup[];
}> {
  try {
    const userPrayerGroups = await db.userPrayerGroup.findMany({
      where: {
        userId: userId,
        groupStatus: GroupStatus.PENDING,
      },
      select: {
        prayerGroup: true,
      },
    });

    if (userPrayerGroups.length === 0) {
      return {
        success: false,
        message: "You have no pending prayer group invitations.",
      };
    }

    const prayerGroups = userPrayerGroups.map(
      (userPrayerGroup) => userPrayerGroup.prayerGroup
    );

    return {
      success: true,
      message:
        "Prayer groups you are pending for have been retrieved successfully.",
      prayerGroups,
    };
  } catch (error: unknown) {
    console.error("Error fetching pending prayer groups:", error);
    return {
      success: false,
      message: "An error occurred while fetching your pending prayer groups.",
    };
  }
}

export async function isUserInGroup(
  groupId: string,
  userId: string
): Promise<boolean> {
  try {
    const membership = await db.userPrayerGroup.findFirst({
      where: {
        prayerGroupId: groupId,
        userId: userId,
      },
      select: { id: true },
    });

    return membership !== null;
  } catch (error) {
    console.error(
      `Error checking if user ${userId} is in group ${groupId}:`,
      error
    );
    return false;
  }
}

export async function getUserGroupStatus(
  groupId: string,
  userId: string
): Promise<"accepted" | "pending" | "none"> {
  try {
    const membership = await db.userPrayerGroup.findFirst({
      where: {
        prayerGroupId: groupId,
        userId: userId,
      },
      select: {
        groupStatus: true,
      },
    });

    if (!membership) {
      return "none";
    }

    if (membership.groupStatus === GroupStatus.ACCEPTED) {
      return "accepted";
    }

    if (membership.groupStatus === GroupStatus.PENDING) {
      return "pending";
    }

    return "none";
  } catch {
    return "none";
  }
}
