"use server";

import prisma from "@/lib/prisma";
import {
  NotificationType,
  PrayerRequest,
  PrayerRequestStatus,
  PrayerVisibility,
  ShareType,
} from "@prisma/client";
import {
  sendNotificationAllDevices,
  sendNotificationToGroups,
} from "@/services/device";
import { getPrayerGroupsForUser } from "@/services/user-prayer-group";
import {
  createPrayerRequestShare,
  deletePrayerRequestShare,
} from "@/services/prayer-request-share";
import { PrayerRequestWithUser, ResponseMessage } from "@/lib/utils";
import { ObjectId } from "mongodb";

// GET Prayer Request by ID
export async function getPrayerRequestById({ id }: { id: string }): Promise<{
  success: boolean;
  message: string;
  prayerRequest: PrayerRequest | null;
}> {
  try {
    if (!ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid ID format",
        prayerRequest: null,
      };
    }

    const prayerRequest = await prisma.prayerRequest.findUnique({
      where: { id },
    });

    if (!prayerRequest) {
      return {
        success: false,
        message: "Prayer request not found",
        prayerRequest: null,
      };
    }
    return {
      success: true,
      message: "Prayer request found",
      prayerRequest,
    };
  } catch {
    return {
      success: false,
      message: "Error fetching prayer request by ID",
      prayerRequest: null,
    };
  }
}

// CREATE Prayer Request
export async function createPrayerRequest({
  request,
  notify,
  sharedWith,
  userId,
  status = PrayerRequestStatus.IN_PROGRESS,
}: {
  request: string;
  notify: boolean;
  sharedWith: { type: "public" | "private" | "group"; id: string }[];
  userId: string;
  status?: PrayerRequestStatus;
}): Promise<{
  success: boolean;
  message: string;
  prayerRequest?: PrayerRequest;
}> {
  try {
    const hasPublicType = sharedWith.some((item) => item.type === "public");
    const hasPrivateType = sharedWith.some((item) => item.type === "private");
    const sharedWithGroups = sharedWith.filter((item) => item.type === "group");
    let newPrayerRequest: PrayerRequest | undefined = undefined;
    const link = `requests/${userId}`;

    const createPrayerRequestEntry = async (visibility: PrayerVisibility) => {
      return await prisma.prayerRequest.create({
        data: {
          request,
          status,
          visibility,
          user: { connect: { id: userId } },
        },
      });
    };

    if (hasPublicType) {
      newPrayerRequest = await createPrayerRequestEntry(
        PrayerVisibility.PUBLIC
      );

      if (notify) {
        const data = await getPrayerGroupsForUser(userId);
        if (data.prayerGroups) {
          await sendNotificationToGroups({
            sharedWithGroups: data.prayerGroups,
            userId,
            notificationLink: link,
          });
        }
      }
    } else if (hasPrivateType) {
      newPrayerRequest = await createPrayerRequestEntry(
        PrayerVisibility.PRIVATE
      );
      if (notify) {
        await sendNotificationAllDevices({
          userId,
          message: "You just added a new private prayer request.",
          notificationType: NotificationType.PRAYER,
          notificationLink: link,
          title: "New Prayer Request",
        });
      }
    } else if (sharedWithGroups.length > 0) {
      const groupIds = sharedWithGroups.map((group) => group.id);

      const invalidGroupIds = groupIds.filter((id) => !ObjectId.isValid(id));

      if (invalidGroupIds.length > 0) {
        return {
          success: false,
          message: `Invalid group ID(s) type provided`,
        };
      }

      // const groups = await prisma.prayerGroup.findMany({
      //   where: {
      //     id: { in: groupIds },
      //   },
      // });

      // const invalidGroups = groupIds.filter(
      //   (id) => !groups.some((group) => group.id === id)
      // );

      // if (invalidGroups.length > 0) {
      //   return {
      //     success: false,
      //     message: "Some group(s) ID(s) not found",
      //   };
      // }

      newPrayerRequest = await createPrayerRequestEntry(
        PrayerVisibility.SHARED
      );
      if (newPrayerRequest != undefined && newPrayerRequest.id) {
        await Promise.all(
          sharedWithGroups.map(async (share) => {
            await prisma.prayerRequestShare.create({
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
          await sendNotificationToGroups({
            sharedWithGroups,
            userId,
            notificationLink: link,
          });
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
  } catch {
    return {
      success: false,
      message: "Error creating prayer request",
    };
  }
}

// UPDATE a Prayer Request by ID
export async function updatePrayerRequest({
  id,
  requestData,
  userId,
}: {
  id: string;
  requestData: {
    request: string;
    status: PrayerRequestStatus;
    sharedWith: { type: string; id: string }[];
  };
  userId: string;
}): Promise<{
  success: boolean;
  message: string;
  prayerRequest: PrayerRequest | null;
}> {
  try {
    if (!ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid ID format",
        prayerRequest: null,
      };
    }

    const prayerRequest = await prisma.prayerRequest.findUnique({
      where: { id },
    });

    if (!prayerRequest) {
      return {
        success: false,
        message: "Prayer request not found",
        prayerRequest: null,
      };
    }

    const { request, status, sharedWith } = requestData;
    const hasPublicType = sharedWith.some((item) => item.type === "public");
    const hasPrivateType = sharedWith.some((item) => item.type === "private");
    const sharedWithGroups = sharedWith.filter((item) => item.type === "group");
    const existingShares = await prisma.prayerRequestShare.findMany({
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

    if (hasPrivateType || hasPublicType) {
      await Promise.all(
        existingShares.map(async (share) => {
          await prisma.prayerRequestShare.delete({
            where: { id: share.id },
          });
        })
      );
    }

    if (sharedWithGroups.length > 0) {
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

    const updatedPrayerRequest = await prisma.prayerRequest.update({
      where: { id },
      data: updatedData,
    });

    return {
      success: true,
      message: "Prayer request updated successfully",
      prayerRequest: updatedPrayerRequest,
    };
  } catch {
    return {
      success: false,
      message: "Error updating prayer request",
      prayerRequest: null,
    };
  }
}

// DELETE a Prayer Request by ID
export async function deletePrayerRequest({
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

    const prayerRequest = await prisma.prayerRequest.findUnique({
      where: { id },
    });

    if (!prayerRequest) {
      return {
        success: false,
        message: "Prayer request not found",
      };
    }

    await prisma.prayerRequest.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Prayer request deleted successfully",
    };
  } catch {
    return {
      success: false,
      message: "Error deleting prayer request",
    };
  }
}

// GET All Prayer Requests for a User
export async function getAllPrayerRequestsByUserId({
  userId,
}: {
  userId: string;
}): Promise<{
  success: boolean;
  message: string;
  prayerRequests: PrayerRequest[] | null;
}> {
  try {
    if (!ObjectId.isValid(userId)) {
      return {
        success: false,
        message: "Invalid ID format",
        prayerRequests: null,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
        prayerRequests: null,
      };
    }

    const prayerRequests = await prisma.prayerRequest.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!prayerRequests.length) {
      return {
        success: false,
        message: "No prayer requests found for this user",
        prayerRequests: null,
      };
    }

    return {
      success: true,
      message: "Successfully fetched prayer requests for this user",
      prayerRequests,
    };
  } catch {
    return {
      success: false,
      message: "Error fetching prayer requests for the user",
      prayerRequests: null,
    };
  }
}

export async function getInProgressPrayerRequestsForUser({
  userId,
}: {
  userId: string;
}): Promise<{
  success: boolean;
  message: string;
  prayerRequests: PrayerRequestWithUser[] | null;
}> {
  try {
    if (!ObjectId.isValid(userId)) {
      return {
        success: false,
        message: "Invalid ID format",
        prayerRequests: null,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
        prayerRequests: null,
      };
    }

    const prayerRequests = (await prisma.prayerRequest.findMany({
      where: {
        userId: userId,
        status: PrayerRequestStatus.IN_PROGRESS,
      },
      include: {
        user: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })) as PrayerRequestWithUser[];

    if (!prayerRequests.length) {
      return {
        success: true,
        message: "No prayer requests found for this user",
        prayerRequests: [],
      };
    }
    return {
      success: true,
      message: "Successfully fetched prayer requests for this user",
      prayerRequests: prayerRequests,
    };
  } catch {
    return {
      success: false,
      message: "Error fetching prayer requests for the user",
      prayerRequests: null,
    };
  }
}

// UPDATE prayer request status
export async function updatePrayerRequestStatus({
  prayerRequestId,
  newStatus,
}: {
  prayerRequestId: string;
  newStatus: PrayerRequestStatus;
}): Promise<ResponseMessage> {
  try {
    if (!ObjectId.isValid(prayerRequestId)) {
      return {
        success: false,
        message: "Invalid ID format",
      };
    }

    const prayerRequest = await prisma.prayerRequest.findUnique({
      where: { id: prayerRequestId },
    });

    if (!prayerRequest) {
      return {
        success: false,
        message: "Prayer Request not found",
      };
    }

    await prisma.prayerRequest.update({
      where: { id: prayerRequestId },
      data: { status: newStatus },
    });

    return {
      success: true,
      message: "Prayer request status updated successfully.",
    };
  } catch {
    return {
      success: false,
      message: "Failed to update prayer request status.",
    };
  }
}

type GroupByResult = {
  prayerGroupId: string;
  _count: {
    prayerGroupId: number;
  };
};

export async function getUserPrayerRequestsVisibleUser({
  userId,
  guestUserId,
}: {
  userId: string;
  guestUserId: string;
}): Promise<{
  success: boolean;
  message: string;
  prayerRequests: PrayerRequestWithUser[];
}> {
  try {
    const publicRequests = (await prisma.prayerRequest.findMany({
      where: {
        userId: userId,
        visibility: PrayerVisibility.PUBLIC,
        status: PrayerRequestStatus.IN_PROGRESS,
      },
      include: {
        user: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })) as PrayerRequestWithUser[];

    const mutualGroupIdsResult = await prisma.userPrayerGroup.groupBy({
      by: ["prayerGroupId"],
      where: {
        userId: { in: [userId, guestUserId] },
        groupStatus: "ACCEPTED",
      },
      having: {
        prayerGroupId: {
          _count: {
            equals: 2,
          },
        },
      },
    });

    const mutualGroupIds = (mutualGroupIdsResult as GroupByResult[]).map(
      (g) => g.prayerGroupId
    );

    const groupSharedRequests = (await prisma.prayerRequest.findMany({
      where: {
        userId,
        status: PrayerRequestStatus.IN_PROGRESS,
        PrayerRequestShare: {
          some: {
            sharedWithId: { in: mutualGroupIds },
            sharedWithType: ShareType.GROUP,
          },
        },
      },
      include: { user: true },
    })) as PrayerRequestWithUser[];

    const allVisibleRequests = [...publicRequests, ...groupSharedRequests];

    return {
      success: true,
      message: "Successfully fetched prayer requests for this user",
      prayerRequests: allVisibleRequests,
    };
  } catch {
    return {
      success: false,
      message: "Error fetching prayer requests for the user",
      prayerRequests: [],
    };
  }
}
