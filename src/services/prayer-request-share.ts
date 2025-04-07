"use server";

import db from "@/lib/db";
import { PrayeRequestWithUser, ResponseMessage } from "@/lib/utils";
import {
  PrayerRequest,
  PrayerRequestShare,
  PrayerRequestStatus,
  ShareType,
  User,
  Visibility,
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
export async function getPrayerRequestsSharedWithUser(userId: string): Promise<{
  success: boolean;
  message: string;
  prayerRequests?: PrayeRequestWithUser[];
}> {
  try {
    // Get all group IDs the user is part of
    const userGroups = await db.userPrayerGroup.findMany({
      where: {
        userId,
      },
      select: {
        prayerGroupId: true,
      },
    });

    const groupIds = userGroups.map((group) => group.prayerGroupId);

    // Get all user IDs in those groups
    const usersInSameGroups = await db.userPrayerGroup.findMany({
      where: {
        prayerGroupId: { in: groupIds },
      },
      select: {
        userId: true,
      },
    });

    const userIdsInGroups = usersInSameGroups.map((ug) => ug.userId);

    // Get all public prayer requests from users in those groups
    const publicPrayerRequestsFromGroupUsers = await db.prayerRequest.findMany({
      where: {
        userId: { in: userIdsInGroups },
        visibility: Visibility.PUBLIC,
      },
      include: {
        user: true,
      },
    });

    // Get prayer requests shared directly with user or user’s groups
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
        visibility: Visibility.SHARED,
      },
      include: {
        user: true,
      },
    });

    // Combine and filter unique by ID using .filter()
    const combinedRequests = [
      ...publicPrayerRequestsFromGroupUsers,
      ...sharedPrayerRequests,
    ];

    const uniquePrayerRequests = combinedRequests
      .filter(
        (request, index, self) =>
          index === self.findIndex((r) => r.id === request.id)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

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

// GET public prayer requests for users in a group
export async function getPublicPrayerRequestsForGroup(
  groupId: string
): Promise<{
  success: boolean;
  message: string;
  data: { prayerRequest: PrayerRequest; user: User }[];
}> {
  try {
    const groupUsers = await db.userPrayerGroup.findMany({
      where: {
        prayerGroupId: groupId,
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
        visibility: Visibility.PUBLIC,
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
      data: prayerRequests.map((prayerRequest) => ({
        prayerRequest,
        user: prayerRequest.user,
      })),
    };
  } catch (error) {
    console.error("Error fetching public prayer requests:", error);
    return {
      success: false,
      message: "Failed to fetch public prayer requests.",
      data: [],
    };
  }
}

// GET prayer requests for a group
export async function getPrayerRequestsForGroup(groupId: string): Promise<{
  success: boolean;
  message: string;
  data: { prayerRequest: PrayerRequest; user: User }[] | null;
}> {
  try {
    const groupRequests = await db.prayerRequest.findMany({
      where: {
        visibility: Visibility.SHARED,
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
        data: null,
      };
    }

    const data = groupRequests.map((prayerRequest) => ({
      prayerRequest,
      user: prayerRequest.user,
    }));

    return {
      success: true,
      message: "Prayer requests retrieved successfully.",
      data,
    };
  } catch (error) {
    console.error("Error retrieving prayer requests for group:", error);
    return {
      success: false,
      message: "Failed to retrieve prayer requests.",
      data: null,
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
    // Find all unique sharedWithIds for the given user
    const sharedWithGroupIds = await db.prayerRequestShare.findMany({
      where: { ownerId: userId },
      select: {
        sharedWithId: true,
      },
      distinct: ["sharedWithId"], // Ensures only unique sharedWithId values are returned
    });

    // Extract the unique sharedWithIds from the result
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
