"use server";

import db from "@/lib/db";
import type { PrayerGroup } from "@prisma/client";

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
    const newPrayerGroup = await db.prayerGroup.create({
      data: {
        name: groupData.name,
        description: groupData.description,
        owner: { connect: { id: groupData.ownerId } }, // Connect the owner
      },
      include: {
        owner: true, // Include owner details (all `User` fields)
      },
    });

    return {
      success: true,
      message: "Successfully created prayer group",
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
