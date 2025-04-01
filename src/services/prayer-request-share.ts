"use server";

import db from "@/lib/db";
import { PrayerRequest, PrayerRequestShare } from "@prisma/client";

// CREATE Prayer Request Share
export async function createPrayerRequestShare(
  prayerRequestId: string,
  sharedWithId: string,
  sharedWithType: "USER" | "GROUP"
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

// DELETE Prayer Request Share
export async function deletePrayerRequestShare(
  prayerRequestId: string,
  sharedWithId: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await db.prayerRequestShare.deleteMany({
      where: {
        prayerRequestId,
        sharedWithId,
      },
    });

    return {
      success: true,
      message: "Successfully unshared prayer request",
    };
  } catch (error: unknown) {
    console.error("Error unsharing prayer request:", error);
    return {
      success: false,
      message: "Error unsharing prayer request:",
    };
  }
}

// GET Prayer Requests Shared with User or a Group that User is Part Of
export async function getPrayerRequestsSharedWithUser(userId: string): Promise<{
  success: boolean;
  message: string;
  prayerRequests?: PrayerRequest[];
}> {
  try {
    // Find all group IDs the user is part of (UserPrayerGroup)
    const userGroups = await db.userPrayerGroup.findMany({
      where: {
        userId: userId,
      },
      select: {
        prayerGroupId: true,
      },
    });

    const groupIds = userGroups.map((group) => group.prayerGroupId);

    // Find all PrayerRequestShares where:
    // 1. It's shared directly with the user (USER type)
    // 2. It's shared with any of the groups the user is part of (GROUP type)
    const sharedPrayerRequestIds = await db.prayerRequestShare.findMany({
      where: {
        OR: [
          {
            sharedWithId: userId,
            sharedWithType: "USER",
          },
          {
            sharedWithId: {
              in: groupIds,
            },
            sharedWithType: "GROUP",
          },
        ],
      },
      select: {
        prayerRequestId: true, // Only select prayerRequestId
      },
    });

    const prayerRequestIds = sharedPrayerRequestIds.map(
      (share) => share.prayerRequestId
    );

    // Find all PrayerRequests that are shared with the user or groups they belong to
    const prayerRequests = await db.prayerRequest.findMany({
      where: {
        id: {
          in: prayerRequestIds, // Filter prayer requests by IDs shared with the user or their groups
        },
      },
    });

    return {
      success: true,
      message: "Successfully fetched prayer requests shared with the user",
      prayerRequests,
    };
  } catch (error: unknown) {
    console.error("Error fetching prayer requests shared with user", error);
    return {
      success: false,
      message: "Error fetching prayer requests shared with user",
    };
  }
}
