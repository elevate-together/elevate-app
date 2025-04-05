"use server";

import db from "@/lib/db";
import {
  PrayerRequest,
  PrayerRequestStatus,
  Visibility,
  ShareType,
  User,
} from "@prisma/client";
import { sendNotificationAllDevices } from "./device";
import {
  getPrayerGroupsForUser,
  getUsersInPrayerGroup,
} from "./user-prayer-group";
import { getUserById } from "./users";

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
      prayerRequest, // Single prayer request type
    };
  } catch (error) {
    console.error(`Error fetching prayer request with ID ${id}:`, error);
    return {
      success: false,
      message: "Error fetching prayer request by ID",
    };
  }
}

// Utility function to send notifications to users in prayer groups
const sendGroupNotifications = async (
  sharedWithGroups: { id: string }[],
  userId: string
) => {
  const usersToNotify: string[] = [];

  for (const group of sharedWithGroups) {
    const groupData = await getUsersInPrayerGroup(group.id);
    if (groupData.success && groupData.users) {
      groupData.users.forEach((user) => {
        if (!usersToNotify.includes(user.id)) {
          usersToNotify.push(user.id);
        }
      });
    }
  }

  const { user } = await getUserById(userId);
  await Promise.all(
    usersToNotify.map(async (tempId) => {
      await sendNotificationAllDevices(
        tempId,
        `${user?.name || "Someone"} shared a prayer request with you!`,
        "New Prayer Request"
      );
    })
  );

  console.log(`Notifications sent to ${usersToNotify.length} unique users.`);
};

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

    const createPrayerRequestEntry = async (visibility: Visibility) => {
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
      newPrayerRequest = await createPrayerRequestEntry(Visibility.PUBLIC);

      if (notify) {
        const data = await getPrayerGroupsForUser(userId);
        if (data.prayerGroups) {
          await sendGroupNotifications(data.prayerGroups, userId);
        }
      }
    } else if (hasPrivateType) {
      newPrayerRequest = await createPrayerRequestEntry(Visibility.PRIVATE);
      if (notify) {
        console.log("Sending Notifications...");
        await sendNotificationAllDevices(
          userId,
          "New personal prayer request added",
          "New Prayer Request"
        );
      }
    } else if (sharedWithGroups.length > 0) {
      newPrayerRequest = await createPrayerRequestEntry(Visibility.SHARED);
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
          console.log("Sending Notifications to shared prayer groups...");
          await sendGroupNotifications(sharedWithGroups, userId);
        }
      }
    } else {
      console.error("Failed to create prayer request entry.");
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
    console.error("Error creating prayer request:", error);
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
    const visibility: Visibility = hasPublicType
      ? Visibility.PUBLIC
      : hasPrivateType
      ? Visibility.PRIVATE
      : Visibility.SHARED;

    const updatedData = {
      request,
      status,
      visibility,
    };

    // if public or private there should be no entries in the shared table
    if (hasPrivateType || hasPublicType) {
      await Promise.all(
        existingShares.map(async (share) => {
          await db.prayerRequestShare.delete({
            where: { id: share.id },
          });
        })
      );
    }

    // if its shared with a group, then update the groups that its shared for.
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
          await db.prayerRequestShare.delete({
            where: { id: share.id },
          });
        })
      );

      await Promise.all(
        sharesToAdd.map(async (share) => {
          await db.prayerRequestShare.create({
            data: {
              prayerRequestId: id,
              sharedWithId: share.id,
              sharedWithType:
                share.type == "group" ? ShareType.GROUP : ShareType.USER,
              ownerId: userId,
            },
          });
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
): Promise<{ success: boolean; message: string }> {
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
export async function getInProgressPrayerRequestsByUserId(
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

// function to populate dropdown in prayer form
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

export async function updatePrayerRequestStatus(
  prayerRequestId: string,
  newStatus: PrayerRequestStatus
): Promise<{ success: boolean; message: string }> {
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
        createdAt: "desc", // Sort by creation date (optional)
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
