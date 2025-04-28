"use server";

import db from "@/lib/db";
import { PrayerRequestWithUser, ResponseMessage } from "@/lib/utils";
import {
  PrayerRequestShare,
  PrayerRequestStatus,
  ShareType,
  PrayerVisibility,
  GroupStatus,
} from "@prisma/client";

// CREATE Prayer Request Share
export async function createPrayerRequestShare(
  prayerRequestId: string,
  sharedWithId: string,
  sharedWithType: "USER" | "GROUP",
  ownerId: string
): Promise<{
  success: boolean;
  message: string;
  prayerRequestShare?: PrayerRequestShare;
}> {
  try {
    const newShare = await db.prayerRequestShare.create({
      data: {
        prayerRequestId,
        sharedWithId,
        sharedWithType,
        ownerId,
      },
    });

    return {
      success: true,
      message: "Successfully shared prayer request",
      prayerRequestShare: newShare,
    };
  } catch (error: unknown) {
    console.error("Error sharing prayer request:", error);
    return {
      success: false,
      message: "Error sharing prayer request",
    };
  }
}

// DELETE prayer request share
export async function deletePrayerRequestShare(
  shareId: string
): Promise<ResponseMessage> {
  try {
    await db.prayerRequestShare.delete({
      where: { id: shareId },
    });

    return {
      success: true,
      message: "Successfully deleted prayer request share.",
    };
  } catch (error) {
    console.error("Error deleting prayer request share:", error);
    return {
      success: false,
      message: "Failed to delete prayer request share.",
    };
  }
}

// GET Prayer Requests Shared with User or a Group that User is Part Of
export async function getPrayerRequestsSharedWithUser(
  userId: string,
  includeUserRequests: boolean = true
): Promise<{
  success: boolean;
  message: string;
  prayerRequests?: PrayerRequestWithUser[];
}> {
  try {
    const groupIds = await getAcceptedGroupIdsForUser(userId);
    const userIdsInGroups = await getUserIdsInGroups(groupIds);

    const filteredUserIds = includeUserRequests
      ? userIdsInGroups
      : userIdsInGroups.filter((id) => id !== userId);

    const publicPrayerRequestsFromGroupUsers = await db.prayerRequest.findMany({
      where: {
        userId: { in: filteredUserIds },
        status: PrayerRequestStatus.IN_PROGRESS,
        visibility: PrayerVisibility.PUBLIC,
      },
      include: {
        user: true,
      },
    });

    const sharedPrayerRequestIds = await db.prayerRequestShare.findMany({
      where: {
        OR: [
          { sharedWithId: userId, sharedWithType: "USER" },
          { sharedWithId: { in: groupIds }, sharedWithType: "GROUP" },
        ],
        prayerRequest: {
          status: PrayerRequestStatus.IN_PROGRESS,
        },
      },
      select: {
        prayerRequestId: true,
      },
    });

    const sharedRequestIds = sharedPrayerRequestIds.map(
      (share) => share.prayerRequestId
    );

    const sharedPrayerRequests = await db.prayerRequest.findMany({
      where: {
        id: { in: sharedRequestIds },
        visibility: PrayerVisibility.SHARED,
        ...(includeUserRequests ? {} : { userId: { not: userId } }),
      },
      include: {
        user: true,
      },
    });

    const combinedRequests = [
      ...publicPrayerRequestsFromGroupUsers,
      ...sharedPrayerRequests,
    ];

    const uniquePrayerRequests = combinedRequests
      .filter(
        (request, index, self) =>
          index === self.findIndex((r) => r.id === request.id)
      )
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return {
      success: true,
      message:
        "Successfully fetched shared and public prayer requests for the user",
      prayerRequests: uniquePrayerRequests,
    };
  } catch (error) {
    console.error("Error fetching prayer requests shared with user", error);
    return {
      success: false,
      message: "Error fetching prayer requests shared with user",
    };
  }
}

// GET public prayer requests for a group
export async function getPublicPrayerRequestsForGroup(
  groupId: string
): Promise<{
  success: boolean;
  message: string;
  prayerRequests?: PrayerRequestWithUser[];
}> {
  try {
    const groupUsers = await db.userPrayerGroup.findMany({
      where: {
        prayerGroupId: groupId,
        groupStatus: GroupStatus.ACCEPTED,
      },
      include: {
        user: true,
      },
    });

    const userIds = groupUsers.map((userGroup) => userGroup.user.id);

    const prayerRequests = await db.prayerRequest.findMany({
      where: {
        userId: {
          in: userIds,
        },
        visibility: PrayerVisibility.PUBLIC,
        status: PrayerRequestStatus.IN_PROGRESS,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        user: true,
      },
    });

    return {
      success: true,
      message: "Public prayer requests fetched successfully.",
      prayerRequests: prayerRequests,
    };
  } catch (error) {
    console.error("Error fetching public prayer requests:", error);
    return {
      success: false,
      message: "Failed to fetch public prayer requests.",
    };
  }
}

// GET prayer requests for a group
export async function getPrayerRequestsForGroup(groupId: string): Promise<{
  success: boolean;
  message: string;
  prayerRequests?: PrayerRequestWithUser[];
}> {
  try {
    const groupRequests = await db.prayerRequest.findMany({
      where: {
        visibility: PrayerVisibility.SHARED,
        status: PrayerRequestStatus.IN_PROGRESS,
        PrayerRequestShare: {
          some: {
            sharedWithType: ShareType.GROUP,
            sharedWithId: groupId,
          },
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (groupRequests.length === 0) {
      return {
        success: false,
        message: "No prayer requests found for this group.",
      };
    }

    return {
      success: true,
      message: "Prayer requests retrieved successfully.",
      prayerRequests: groupRequests,
    };
  } catch (error) {
    console.error("Error retrieving prayer requests for group:", error);
    return {
      success: false,
      message: "Failed to retrieve prayer requests.",
    };
  }
}

// Function to populate dropdown in prayer form
export async function getSharedGroupIds(userId: string): Promise<{
  success: boolean;
  message: string;
  sharedWith?: string[];
}> {
  try {
    const sharedWithGroupIds = await db.prayerRequestShare.findMany({
      where: { ownerId: userId },
      select: {
        sharedWithId: true,
      },
      distinct: ["sharedWithId"],
    });

    const uniqueSharedWithIds = sharedWithGroupIds.map(
      (share) => share.sharedWithId
    );

    return {
      success: true,
      message: "Successfully fetched shared prayer groups for this user",
      sharedWith: uniqueSharedWithIds,
    };
  } catch (error) {
    console.error(
      `Error fetching shared groups for user with ID ${userId}:`,
      error
    );
    return {
      success: false,
      message: "Error fetching shared groups for the user",
    };
  }
}

// GET prayer requests for a group
async function getAcceptedGroupIdsForUser(userId: string): Promise<string[]> {
  const userGroups = await db.userPrayerGroup.findMany({
    where: {
      userId,
      groupStatus: GroupStatus.ACCEPTED,
    },
    select: {
      prayerGroupId: true,
    },
  });

  return userGroups.map((group) => group.prayerGroupId);
}
async function getUserIdsInGroups(groupIds: string[]): Promise<string[]> {
  const users = await db.userPrayerGroup.findMany({
    where: {
      prayerGroupId: { in: groupIds },
      groupStatus: GroupStatus.ACCEPTED,
    },
    select: { userId: true },
  });

  return users.map((u) => u.userId);
}
