"use server";

import db from "@/lib/db";
import type { PrayerGroup, PrayerRequest } from "@prisma/client";

import type { User } from "@prisma/client";

/// GET All PrayerGroups
export async function getAllPrayerGroups(): Promise<{
  success: boolean;
  message: string;
  prayerGroups?: (PrayerGroup & { owner: User })[]; // Use the `User` type here
}> {
  try {
    const prayerGroups = await db.prayerGroup.findMany({
      include: {
        owner: true, // Prisma will include all `User` fields by default
      },
    });
    return {
      success: true,
      message: "Successfully fetched all prayer groups",
      prayerGroups,
    };
  } catch (error: unknown) {
    console.error("Error fetching prayer groups:", error);
    return {
      success: false,
      message: "Error fetching prayer groups",
    };
  }
}

// GET PrayerGroup by ID
export async function getPrayerGroupById(id: string): Promise<{
  success: boolean;
  message: string;
  prayerGroup?: PrayerGroup & { owner: User }; // Use the `User` type here as well
}> {
  try {
    const prayerGroup = await db.prayerGroup.findUnique({
      where: { id },
      include: {
        owner: true, // Include the owner with all fields from the `User` model
      },
    });

    if (!prayerGroup) {
      return {
        success: false,
        message: "Prayer group not found",
      };
    }

    return {
      success: true,
      message: "Prayer group found",
      prayerGroup, // Single PrayerGroup object with owner of type `User`
    };
  } catch (error) {
    console.error(`Error fetching prayer group with ID ${id}:`, error);
    return {
      success: false,
      message: "Error fetching prayer group by ID",
    };
  }
}

export async function createPrayerGroup(groupData: {
  name: string;
  ownerId: string;
  description?: string;
}): Promise<{
  success: boolean;
  message: string;
  prayerGroup?: PrayerGroup & { owner: User };
}> {
  try {
    // Create the new prayer group
    const newPrayerGroup = await db.prayerGroup.create({
      data: {
        name: groupData.name,
        description: groupData.description,
        owner: { connect: { id: groupData.ownerId } }, // Connect the owner as the owner of the prayer group
      },
      include: {
        owner: true, // Include the owner information in the result
      },
    });

    // Add the owner as a member of the prayer group
    await db.userPrayerGroup.create({
      data: {
        userId: groupData.ownerId, // The owner is also a member
        prayerGroupId: newPrayerGroup.id, // The newly created prayer group's ID
      },
    });

    return {
      success: true,
      message: "Successfully created prayer group.",
      prayerGroup: newPrayerGroup,
    };
  } catch (error) {
    console.error("Error creating prayer group:", error);
    return {
      success: false,
      message: "Error creating prayer group, try again.",
    };
  }
}

export async function updatePrayerGroup(
  id: string,
  groupData: { name?: string; description?: string }
): Promise<{
  success: boolean;
  message: string;
  prayerGroup?: PrayerGroup & { owner: User }; // Include owner of type `User`
}> {
  try {
    const prayerGroup = await db.prayerGroup.findUnique({
      where: { id },
    });

    if (!prayerGroup) {
      return {
        success: false,
        message: "Prayer group not found",
      };
    }

    const updatedPrayerGroup = await db.prayerGroup.update({
      where: { id },
      data: groupData,
      include: {
        owner: true, // Include owner details (all `User` fields)
      },
    });

    return {
      success: true,
      message: "Prayer group updated successfully",
      prayerGroup: updatedPrayerGroup,
    };
  } catch (error) {
    console.error(`Error updating prayer group with ID ${id}:`, error);
    return {
      success: false,
      message: "Error updating prayer group",
    };
  }
}

// DELETE a PrayerGroup by ID
export async function deletePrayerGroup(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const prayerGroup = await db.prayerGroup.findUnique({
      where: { id },
      include: {
        owner: true, // Optionally, you can include owner info when deleting
      },
    });

    if (!prayerGroup) {
      return {
        success: false,
        message: "Prayer group not found",
      };
    }

    await db.prayerGroup.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Prayer group deleted successfully",
    };
  } catch (error) {
    console.error(`Error deleting prayer group with ID ${id}:`, error);
    return {
      success: false,
      message: "Error deleting prayer group",
    };
  }
}

export async function getInProgressPrayerRequestsByGroupId(
  groupId: string
): Promise<{
  success: boolean;
  message: string;
  prayerRequests?: (PrayerRequest & { user: User })[];
}> {
  try {
    // Fetch prayer requests for the given group with 'IN_PROGRESS' status
    const prayerRequests = await db.prayerRequest.findMany({
      where: {
        user: {
          prayerGroups: {
            some: {
              prayerGroupId: groupId,
            },
          },
        },
        status: "IN_PROGRESS", // Check for 'IN_PROGRESS' status
      },
      include: {
        user: true, // Include user details along with prayer requests
      },
    });

    if (prayerRequests.length === 0) {
      return {
        success: false,
        message: "No in-progress prayer requests found for this group",
      };
    }

    return {
      success: true,
      message: "Successfully fetched in-progress prayer requests",
      prayerRequests,
    };
  } catch (error) {
    console.error(
      `Error fetching in-progress prayer requests for group ${groupId}:`,
      error
    );
    return {
      success: false,
      message: "Error fetching in-progress prayer requests",
    };
  }
}
