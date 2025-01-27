"use server";

import db from "@/lib/db";
import type { PrayerGroup } from "@prisma/client";

// GET All PrayerGroups
export async function getAllPrayerGroups(): Promise<{
  success: boolean;
  message: string;
  prayerGroups?: PrayerGroup[];
}> {
  try {
    const prayerGroups = await db.prayerGroup.findMany();
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
  prayerGroup?: PrayerGroup;
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

    return {
      success: true,
      message: "Prayer group found",
      prayerGroup, // Single PrayerGroup object
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
  description?: string;
}): Promise<{
  success: boolean;
  message: string;
  prayerGroup?: PrayerGroup;
}> {
  try {
    const newPrayerGroup = await db.prayerGroup.create({
      data: groupData,
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
  prayerGroup?: PrayerGroup;
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
