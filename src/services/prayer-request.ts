"use server";

import db from "@/lib/db";
import {
  PrayerRequest,
  PrayerRequestStatus,
  PrayerVisibility,
  ShareType,
} from "@prisma/client";
import { sendNotificationAllDevices, sendNotificationToGroups } from "./device";
import { getPrayerGroupsForUser } from "./user-prayer-group";
import {
  createPrayerRequestShare,
  deletePrayerRequestShare,
} from "./prayer-request-share";
import { ResponseMessage } from "@/lib/utils";

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

    console.log("public? ", hasPublicType);
    console.log("private? ", hasPublicType);
    console.log("groups? ", sharedWithGroups);

    let newPrayerRequest: PrayerRequest | undefined = undefined;

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

    // Share the prayer request with everyone
    if (hasPublicType) {
      newPrayerRequest = await createPrayerRequestEntry(
        PrayerVisibility.PUBLIC
      );

      // send a notification to all users in groups
      if (notify) {
        const data = await getPrayerGroupsForUser(userId);
        if (data.prayerGroups) {
          await sendNotificationToGroups(data.prayerGroups, userId);
        }
      }
    }
    // Just share with yourself
    else if (hasPrivateType) {
      newPrayerRequest = await createPrayerRequestEntry(
        PrayerVisibility.PRIVATE
      );
      if (notify) {
        await sendNotificationAllDevices(
          userId,
          "You just added a new private prayer request.",
          "New Prayer Request"
        );
      }
    }
    // Share with groups, create entry in the join table for which groups
    else if (sharedWithGroups.length > 0) {
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
          await sendNotificationToGroups(sharedWithGroups, userId);
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

    // Prepare the data for update
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

    // If public or private there should be no entries in the shared table
    if (hasPrivateType || hasPublicType) {
      await Promise.all(
        existingShares.map(async (share) => {
          await db.prayerRequestShare.delete({
            where: { id: share.id },
          });
        })
      );
    }

    // If its shared with a group, then update the groups that its shared for.
    if (sharedWithGroups.length > 0) {
      // Only update sharedWith if there are changes
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

    // Update the prayer request with the new data
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
        userId: userId, // Filter prayer requests by user ID
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

// GET Inprogress Prayer Requests for a User
export async function getPersonalPrayerRequestsForUser(
  userId: string
): Promise<{
  success: boolean;
  message: string;
  prayerRequests?: PrayerRequest[];
}> {
  try {
    const prayerRequests = await db.prayerRequest.findMany({
      where: {
        userId: userId,
        status: PrayerRequestStatus.IN_PROGRESS,
        visibility: PrayerVisibility.PRIVATE,
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
