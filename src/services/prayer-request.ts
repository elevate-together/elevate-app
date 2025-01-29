"use server";

import db from "@/lib/db";
import { PrayerRequest, PrayerRequestStatus } from "@prisma/client";

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
  status?: PrayerRequestStatus; // 'PENDING' by default if not provided
  userId: string;
}): Promise<{
  success: boolean;
  message: string;
  prayerRequest?: PrayerRequest;
}> {
  try {
    const newPrayerRequest = await db.prayerRequest.create({
      data: {
        request: requestData.request,
        status: requestData.status || PrayerRequestStatus.PENDING, // Default to PENDING
        user: {
          connect: { id: requestData.userId }, // Connect to the user by ID
        },
      },
    });

    return {
      success: true,
      message: "Successfully created prayer request",
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
