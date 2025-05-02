"use server";

import db from "@/lib/db";
import {
  NotificationType,
  PrayerRequest,
  PrayerRequestStatus,
  PrayerVisibility,
  ShareType,
} from "@prisma/client";
import {
  sendNotificationAllDevices,
  sendNotificationToGroups,
} from "@/services/device";
import { getPrayerGroupsForUser } from "@/services/user-prayer-group";
import {
  createPrayerRequestShare,
  deletePrayerRequestShare,
} from "@/services/prayer-request-share";
import { PrayerRequestWithUser, ResponseMessage } from "@/lib/utils";

// GET Prayer Request by ID
export async function getPrayerRequestById(id: string): Promise<{
  success: boolean;
  message: string;
  prayerRequest?: PrayerRequest;
}> {
  try {
    const prayerRequest = await db.prayerRequest.findUnique({
      where: { id },
    });
    if (!prayerRequest) {
      return {
        success: false,
        message: "Prayer request not found",
      };
    }
    return {
      success: true,
      message: "Prayer request found",
      prayerRequest,
    };
  } catch (error) {
    console.error(`Error fetching prayer request with ID ${id}:`, error);
    return {
      success: false,
      message: "Error fetching prayer request by ID",
    };
  }
}

// CREATE Prayer Request
export async function createPrayerRequest(requestData: {
  request: string;
  notify: boolean;
  sharedWith: { type: string; id: string }[];
  userId: string;
  status?: PrayerRequestStatus;
}): Promise<{
  success: boolean;
  message: string;
  prayerRequest?: PrayerRequest;
}> {
  try {
    const { request, notify, sharedWith, userId, status } = requestData;
    const requestStatus = status || PrayerRequestStatus.IN_PROGRESS;

    const hasPublicType = sharedWith.some((item) => item.type === "public");
    const hasPrivateType = sharedWith.some((item) => item.type === "private");
    const sharedWithGroups = sharedWith.filter((item) => item.type === "group");
    let newPrayerRequest: PrayerRequest | undefined = undefined;
    const link = `requests/${userId}`;

    const createPrayerRequestEntry = async (visibility: PrayerVisibility) => {
      return await db.prayerRequest.create({
        data: {
          request,
          status: requestStatus,
          visibility,
          user: { connect: { id: userId } },
        },
      });
    };

    if (hasPublicType) {
      newPrayerRequest = await createPrayerRequestEntry(
        PrayerVisibility.PUBLIC
      );

      if (notify) {
        const data = await getPrayerGroupsForUser(userId);
        if (data.prayerGroups) {
          await sendNotificationToGroups(data.prayerGroups, userId, link);
        }
      }
    } else if (hasPrivateType) {
      newPrayerRequest = await createPrayerRequestEntry(
        PrayerVisibility.PRIVATE
      );
      if (notify) {
        await sendNotificationAllDevices(
          userId,
          "You just added a new private prayer request.",
          NotificationType.PRAYER,
          link,
          "New Prayer Request"
        );
      }
    } else if (sharedWithGroups.length > 0) {
      newPrayerRequest = await createPrayerRequestEntry(
        PrayerVisibility.SHARED
      );
      if (newPrayerRequest != undefined && newPrayerRequest.id) {
        await Promise.all(
          sharedWithGroups.map(async (share) => {
            await db.prayerRequestShare.create({
              data: {
                prayerRequestId: newPrayerRequest?.id || "-1",
                sharedWithId: share.id,
                sharedWithType: ShareType.GROUP,
                ownerId: userId,
              },
            });
          })
        );
        if (notify) {
          await sendNotificationToGroups(sharedWithGroups, userId, link);
        }
      }
    } else {
      return {
        success: false,
        message: "Error creating prayer request, try again.",
      };
    }
    return {
      success: true,
      message: "Successfully added prayer request",
      prayerRequest: newPrayerRequest,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return {
      success: false,
      message: `Error creating prayer request: ${errorMessage}`,
    };
  }
}

// UPDATE a Prayer Request by ID
export async function updatePrayerRequest(
  id: string,
  requestData: {
    request: string;
    status: PrayerRequestStatus;
    sharedWith: { type: string; id: string }[];
  },
  userId: string
): Promise<{
  success: boolean;
  message: string;
  prayerRequest?: PrayerRequest;
}> {
  try {
    const prayerRequest = await db.prayerRequest.findUnique({
      where: { id },
    });

    if (!prayerRequest) {
      return {
        success: false,
        message: "Prayer request not found",
      };
    }

    const { request, status, sharedWith } = requestData;
    const hasPublicType = sharedWith.some((item) => item.type === "public");
    const hasPrivateType = sharedWith.some((item) => item.type === "private");
    const sharedWithGroups = sharedWith.filter((item) => item.type === "group");
    const existingShares = await db.prayerRequestShare.findMany({
      where: { prayerRequestId: id },
    });
    const visibility: PrayerVisibility = hasPublicType
      ? PrayerVisibility.PUBLIC
      : hasPrivateType
      ? PrayerVisibility.PRIVATE
      : PrayerVisibility.SHARED;

    const updatedData = {
      request,
      status,
      visibility,
    };

    if (hasPrivateType || hasPublicType) {
      await Promise.all(
        existingShares.map(async (share) => {
          await db.prayerRequestShare.delete({
            where: { id: share.id },
          });
        })
      );
    }

    if (sharedWithGroups.length > 0) {
      const sharesToAdd = sharedWith.filter(
        (newShare) =>
          !existingShares.some(
            (existingShare) => existingShare.sharedWithId === newShare.id
          )
      );
      const sharesToRemove = existingShares.filter(
        (existingShare) =>
          !sharedWith.some(
            (newShare) => newShare.id === existingShare.sharedWithId
          )
      );

      await Promise.all(
        sharesToRemove.map(async (share) => {
          deletePrayerRequestShare(share.id);
        })
      );
      await Promise.all(
        sharesToAdd.map(async (share) => {
          await createPrayerRequestShare(
            id,
            share.id,
            share.type == "group" ? ShareType.GROUP : ShareType.USER,
            userId
          );
        })
      );
    }

    const updatedPrayerRequest = await db.prayerRequest.update({
      where: { id },
      data: updatedData,
    });

    return {
      success: true,
      message: "Prayer request updated successfully",
      prayerRequest: updatedPrayerRequest,
    };
  } catch (error) {
    console.error(`Error updating prayer request with ID ${id}:`, error);
    return {
      success: false,
      message: "Error updating prayer request",
    };
  }
}

// DELETE a Prayer Request by ID
export async function deletePrayerRequest(
  id: string
): Promise<ResponseMessage> {
  try {
    const prayerRequest = await db.prayerRequest.findUnique({
      where: { id },
    });

    if (!prayerRequest) {
      return {
        success: false,
        message: "Prayer request not found",
      };
    }

    await db.prayerRequest.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Prayer request deleted successfully",
    };
  } catch (error) {
    console.error(`Error deleting prayer request with ID ${id}:`, error);
    return {
      success: false,
      message: "Error deleting prayer request",
    };
  }
}

// GET All Prayer Requests for a User
export async function getPrayerRequestsByUserId(userId: string): Promise<{
  success: boolean;
  message: string;
  prayerRequests?: PrayerRequest[];
}> {
  try {
    const prayerRequests = await db.prayerRequest.findMany({
      where: {
        userId: userId,
      },
    });

    if (!prayerRequests.length) {
      return {
        success: false,
        message: "No prayer requests found for this user",
      };
    }

    return {
      success: true,
      message: "Successfully fetched prayer requests for this user",
      prayerRequests,
    };
  } catch (error) {
    console.error(
      `Error fetching prayer requests for user with ID ${userId}:`,
      error
    );
    return {
      success: false,
      message: "Error fetching prayer requests for the user",
    };
  }
}

export async function getInProgressPrayerRequestsForUser(
  userId: string
): Promise<{
  success: boolean;
  message: string;
  prayerRequests?: PrayerRequestWithUser[];
}> {
  try {
    const prayerRequests = await db.prayerRequest.findMany({
      where: {
        userId: userId,
        status: PrayerRequestStatus.IN_PROGRESS,
      },
      include: {
        user: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!prayerRequests.length) {
      return {
        success: true,
        message: "No prayer requests found for this user",
        prayerRequests: [],
      };
    }
    return {
      success: true,
      message: "Successfully fetched prayer requests for this user",
      prayerRequests: prayerRequests,
    };
  } catch (error) {
    console.error(
      `Error fetching prayer requests for user with ID ${userId}:`,
      error
    );
    return {
      success: false,
      message: "Error fetching prayer requests for the user",
    };
  }
}

// UPDATE prayer request status
export async function updatePrayerRequestStatus(
  prayerRequestId: string,
  newStatus: PrayerRequestStatus
): Promise<ResponseMessage> {
  try {
    await db.prayerRequest.update({
      where: { id: prayerRequestId },
      data: { status: newStatus },
    });

    return {
      success: true,
      message: "Prayer request status updated successfully.",
    };
  } catch (error) {
    console.error("Error updating prayer request status:", error);
    return {
      success: false,
      message: "Failed to update prayer request status.",
    };
  }
}

export async function getUserPrayerRequestsVisibleUser(
  userId: string,
  guestUserId: string
): Promise<{
  success: boolean;
  message: string;
  prayerRequests: PrayerRequestWithUser[];
}> {
  try {
    const publicRequests = await db.prayerRequest.findMany({
      where: {
        userId: userId,
        visibility: PrayerVisibility.PUBLIC,
        status: PrayerRequestStatus.IN_PROGRESS,
      },
      include: {
        user: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const mutualGroupIdsResult = await db.userPrayerGroup.groupBy({
      by: ["prayerGroupId"],
      where: {
        userId: { in: [userId, guestUserId] },
        groupStatus: "ACCEPTED",
      },
      having: {
        prayerGroupId: {
          _count: {
            equals: 2,
          },
        },
      },
    });

    const mutualGroupIds = mutualGroupIdsResult.map((g) => g.prayerGroupId);

    const groupSharedRequests = await db.prayerRequest.findMany({
      where: {
        userId,
        status: "IN_PROGRESS",
        PrayerRequestShare: {
          some: {
            sharedWithId: { in: mutualGroupIds },
            sharedWithType: "GROUP",
          },
        },
      },
      include: { user: true },
    });

    const allVisibleRequests = [...publicRequests, ...groupSharedRequests];

    return {
      success: true,
      message: "Successfully fetched prayer requests for this user",
      prayerRequests: allVisibleRequests,
    };
  } catch (error) {
    console.error(
      `Error fetching prayer requests for user with ID ${userId}:`,
      error
    );
    return {
      success: false,
      message: "Error fetching prayer requests for the user",
      prayerRequests: [],
    };
  }
}
