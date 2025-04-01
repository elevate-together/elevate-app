"use server";

import db from "@/lib/db";
import { PrayerRequest, PrayerRequestStatus, Visibility } from "@prisma/client";
import { sendNotificationAllDevices } from "./device";
import {
  getPrayerGroupsForUser,
  getUsersInPrayerGroup,
} from "./user-prayer-group";
import { getUserById } from "./users";

// GET All Prayer Requests
export async function getAllPrayerRequests(): Promise<{
  success: boolean;
  message: string;
  prayerRequests?: PrayerRequest[];
}> {
  try {
    const prayerRequests = await db.prayerRequest.findMany();
    return {
      success: true,
      message: "Successfully fetched all prayer requests",
      prayerRequests,
    };
  } catch (error: unknown) {
    console.error("Error fetching prayer requests:", error);
    return {
      success: false,
      message: "Error fetching prayer requests",
    };
  }
}

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

// CREATE a New Prayer Request
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

    const { user } = await getUserById(userId);

    let newPrayerRequest;

    if (hasPublicType) {
      console.log("This prayer request will be shared publicly.");

      newPrayerRequest = await db.prayerRequest.create({
        data: {
          request,
          status: requestStatus,
          visibility: Visibility.PUBLIC,
          user: { connect: { id: userId } },
        },
      });

      const usersToNotify: string[] = []; // Use an array instead of a Set
      if (notify) {
        console.log("Sending Notifications to prayer groups...");
        const data = await getPrayerGroupsForUser(userId);
        if (data.prayerGroups) {
          for (const group of data.prayerGroups) {
            const groupData = await getUsersInPrayerGroup(group.id);

            if (groupData.success && groupData.users) {
              groupData.users.forEach((user) => {
                if (!usersToNotify.includes(user.id)) {
                  usersToNotify.push(user.id);
                }
              });
            }
          }
        }

        // Convert the Set to an array and notify each user
        await Promise.all(
          [...usersToNotify].map(async (tempId) => {
            await sendNotificationAllDevices(
              tempId,
              user?.name
                ? `${user.name} added a new prayer request `
                : "Someone added a new prayer request"
            );
          })
        );

        console.log(
          `Notifications sent to ${usersToNotify.length} unique users.`
        );
      }
    } else if (hasPrivateType) {
      console.log("This prayer request will be shared privately.");

      newPrayerRequest = await db.prayerRequest.create({
        data: {
          request,
          status: requestStatus,
          visibility: Visibility.PRIVATE,
          user: { connect: { id: userId } },
        },
      });

      if (notify) {
        console.log("Sending Notifications...");
        await sendNotificationAllDevices(
          userId,
          "New personal prayer request added"
        );
      }
    } else {
      console.log("TODO");
      return {
        success: false,
        message:
          "Error: No valid visibility type selected (public or private).",
      };
    }

    return {
      success: true,
      message: "Successfully added prayer request",
      prayerRequest: newPrayerRequest,
    };
  } catch (error) {
    console.error("Error creating prayer request:", error);
    return {
      success: false,
      message: "Error creating prayer request, try again.",
    };
  }
}

// UPDATE a Prayer Request by ID
export async function updatePrayerRequest(
  id: string,
  requestData: {
    request?: string;
    status?: PrayerRequestStatus; // Option to update status as well
  }
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

    const updatedPrayerRequest = await db.prayerRequest.update({
      where: { id },
      data: requestData,
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
