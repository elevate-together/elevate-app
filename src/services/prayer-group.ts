"use server";

import db from "@/lib/db";
import { GroupStatus, GroupType, PrayerGroup } from "@prisma/client";
import type { User } from "@prisma/client";

// GET PrayerGroup by ID
export async function getPrayerGroupById(id: string): Promise<{
  success: boolean;
  message: string;
  prayerGroup?: PrayerGroup & { owner: User; memberCount: number }; // Use the `User` type here as well
}> {
  try {
    const prayerGroup = await db.prayerGroup.findUnique({
      where: { id },
      include: {
        owner: true, // Include the owner with all fields from the `User` model
        users: true,
      },
    });

    if (!prayerGroup) {
      return {
        success: false,
        message: "Prayer group not found",
      };
    }

    const memberCount = prayerGroup.users?.length || 0;

    return {
      success: true,
      message: "Prayer group found",
      prayerGroup: {
        ...prayerGroup, // Include the existing prayer group data
        memberCount, // Add the member count
      },
    };
  } catch (error) {
    console.error(`Error fetching prayer group with ID ${id}:`, error);
    return {
      success: false,
      message: "Error fetching prayer group by ID",
    };
  }
}

// Create prayer group
export async function createPrayerGroup(groupData: {
  name: string;
  ownerId: string;
  groupType: GroupType;
  description?: string;
}): Promise<{
  success: boolean;
  message: string;
  prayerGroup?: PrayerGroup & { owner: User };
}> {
  try {
    const { name, ownerId, groupType, description } = groupData;
    // Create the new prayer group
    const newPrayerGroup = await db.prayerGroup.create({
      data: {
        name: name,
        description: description,
        owner: { connect: { id: ownerId } },
        groupType: groupType,
      },
      include: {
        owner: true, // Include the owner information in the result
      },
    });

    // Add the owner as a member of the prayer group
    await db.userPrayerGroup.create({
      data: {
        userId: groupData.ownerId,
        prayerGroupId: newPrayerGroup.id,
        groupStatus: GroupStatus.ACCEPTED,
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

// UPDATE prayer group
export async function updatePrayerGroup(
  id: string,
  groupData: { name?: string; description?: string; groupType?: GroupType }
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
