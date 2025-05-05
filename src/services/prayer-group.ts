"use server";

import db from "@/lib/db";
import {
  PrayerGroupWithOwner,
  PrayerGroupWithOwnerAndCount,
  ResponseMessage,
} from "@/lib/utils";
import { GroupStatus, GroupType } from "@prisma/client";
import { ObjectId } from "mongodb";

// GET PrayerGroup by ID
export async function getPrayerGroupById({ id }: { id: string }): Promise<{
  success: boolean;
  message: string;
  prayerGroup: PrayerGroupWithOwner | null;
}> {
  try {
    if (!ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid ID format",
        prayerGroup: null,
      };
    }

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
        prayerGroup: null,
      };
    }

    return {
      success: true,
      message: "Prayer group found",
      prayerGroup: prayerGroup,
    };
  } catch {
    return {
      success: false,
      message: "Error fetching prayer group by ID",
      prayerGroup: null,
    };
  }
}

export async function getPrayerGroupWithCountById(id: string): Promise<{
  success: boolean;
  message: string;
  prayerGroup: PrayerGroupWithOwnerAndCount | null;
}> {
  try {
    if (!ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid ID format",
        prayerGroup: null,
      };
    }

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
        prayerGroup: null,
      };
    }

    return {
      success: true,
      message: "Prayer group found",
      prayerGroup: prayerGroup,
    };
  } catch {
    return {
      success: false,
      message: "Error fetching prayer group by ID",
      prayerGroup: null,
    };
  }
}

// CREATE prayer group
export async function createPrayerGroup({
  name,
  ownerId,
  groupType,
  description = "",
}: {
  name: string;
  ownerId: string;
  groupType: GroupType;
  description?: string;
}): Promise<{
  success: boolean;
  message: string;
  prayerGroup: PrayerGroupWithOwner | null;
}> {
  try {
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
        userId: ownerId,
        prayerGroupId: newPrayerGroup.id,
        groupStatus: GroupStatus.ACCEPTED,
      },
    });

    return {
      success: true,
      message: "Successfully created prayer group.",
      prayerGroup: newPrayerGroup,
    };
  } catch {
    return {
      success: false,
      message: "Error creating prayer group, try again.",
      prayerGroup: null,
    };
  }
}

// UPDATE prayer group
export async function updatePrayerGroup({
  id,
  groupData,
}: {
  id: string;
  groupData: { name?: string; description?: string; groupType?: GroupType };
}): Promise<{
  success: boolean;
  message: string;
  prayerGroup: PrayerGroupWithOwner | null;
}> {
  try {
    if (!ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid ID format",
        prayerGroup: null,
      };
    }

    const prayerGroup = await db.prayerGroup.findUnique({
      where: { id },
    });

    if (!prayerGroup) {
      return {
        success: false,
        message: "Prayer group not found",
        prayerGroup: null,
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
  } catch {
    return {
      success: false,
      message: "Error updating prayer group",
      prayerGroup: null,
    };
  }
}

// DELETE a PrayerGroup by ID
export async function deletePrayerGroup({
  id,
}: {
  id: string;
}): Promise<ResponseMessage> {
  try {
    if (!ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid ID format",
      };
    }

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
  } catch {
    return {
      success: false,
      message: "Error deleting prayer group",
    };
  }
}

// UPDATE a PrayerGroup owner
export async function updatePrayerGroupOwner({
  prayerGroupId,
  newOwnerId,
}: {
  prayerGroupId: string;
  newOwnerId: string;
}): Promise<{
  success: boolean;
  message: string;
  prayerGroup: PrayerGroupWithOwner | null;
}> {
  try {
    if (!ObjectId.isValid(prayerGroupId)) {
      return {
        success: false,
        message: "Invalid ID format",
        prayerGroup: null,
      };
    }

    const prayerGroup = await db.prayerGroup.findUnique({
      where: { id: prayerGroupId },
    });

    if (!prayerGroup) {
      return {
        success: false,
        message: "Prayer group not found",
        prayerGroup: null,
      };
    }

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
  } catch {
    return {
      success: false,
      message: "Failed to update prayer group owner.",
      prayerGroup: null,
    };
  }
}
