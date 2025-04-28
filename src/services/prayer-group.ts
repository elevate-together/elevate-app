"use server";

import db from "@/lib/db";
import {
  PrayerGroupWithOwner,
  PrayerGroupWithOwnerAndCount,
} from "@/lib/utils";
import { GroupStatus, GroupType, PrayerGroup } from "@prisma/client";
import type { User } from "@prisma/client";

// GET PrayerGroup by ID
export async function getPrayerGroupById(id: string): Promise<{
  success: boolean;
  message: string;
  prayerGroup?: PrayerGroupWithOwner;
}> {
  try {
    const prayerGroup = await db.prayerGroup.findUnique({
      where: { id },
      include: {
        owner: true,
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
      prayerGroup: prayerGroup,
    };
  } catch (error) {
    console.error(`Error fetching prayer group with ID ${id}:`, error);
    return {
      success: false,
      message: "Error fetching prayer group by ID",
    };
  }
}

export async function getPrayerGroupWithCountById(id: string): Promise<{
  success: boolean;
  message: string;
  prayerGroup?: PrayerGroupWithOwnerAndCount;
}> {
  try {
    const prayerGroup = await db.prayerGroup.findUnique({
      where: { id },
      include: {
        owner: true,
        _count: {
          select: { users: true },
        },
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
      prayerGroup: prayerGroup,
    };
  } catch (error) {
    console.error(`Error fetching prayer group with ID ${id}:`, error);
    return {
      success: false,
      message: "Error fetching prayer group by ID",
    };
  }
}

// CREATE prayer group
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
    const newPrayerGroup = await db.prayerGroup.create({
      data: {
        name: name,
        description: description,
        owner: { connect: { id: ownerId } },
        groupType: groupType,
      },
      include: {
        owner: true,
      },
    });

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
  prayerGroup?: PrayerGroup & { owner: User };
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
        owner: true,
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

// UPDATE a PrayerGroup owner
export async function updatePrayerGroupOwner(
  prayerGroupId: string,
  newOwnerId: string
): Promise<{
  success: boolean;
  message: string;
  prayerGroup?: PrayerGroup & { owner: User };
}> {
  try {
    const updatedPrayerGroup = await db.prayerGroup.update({
      where: { id: prayerGroupId },
      data: {
        owner: {
          connect: { id: newOwnerId },
        },
      },
      include: {
        owner: true,
      },
    });

    const existingMembership = await db.userPrayerGroup.findFirst({
      where: {
        userId: newOwnerId,
        prayerGroupId: prayerGroupId,
      },
    });

    if (!existingMembership) {
      await db.userPrayerGroup.create({
        data: {
          userId: newOwnerId,
          prayerGroupId: prayerGroupId,
          groupStatus: GroupStatus.ACCEPTED,
        },
      });
    }

    return {
      success: true,
      message: "Prayer group owner updated successfully.",
      prayerGroup: updatedPrayerGroup,
    };
  } catch (error) {
    console.error("Error updating prayer group owner:", error);
    return {
      success: false,
      message: "Failed to update prayer group owner.",
    };
  }
}
