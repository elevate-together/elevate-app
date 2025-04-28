import { FriendStatus } from "@prisma/client";
import db from "@/lib/db";

export async function sendFriendRequest(
  senderId: string,
  receiverId: string
): Promise<{
  success: boolean;
  message: string;
  friendRequestId?: string;
}> {
  try {
    const existingRequest = await db.userFriend.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existingRequest) {
      return {
        success: false,
        message: "Friend request already exists or already friends.",
      };
    }

    const newFriendRequest = await db.userFriend.create({
      data: {
        senderId,
        receiverId,
        status: FriendStatus.PENDING,
      },
    });

    return {
      success: true,
      message: "Friend request sent successfully.",
      friendRequestId: newFriendRequest.id,
    };
  } catch (error) {
    console.error(
      `Error sending friend request from ${senderId} to ${receiverId}:`,
      error
    );
    return {
      success: false,
      message: "Error sending friend request.",
    };
  }
}

export async function acceptFriendRequest(
  senderId: string,
  receiverId: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const friendRequest = await db.userFriend.findFirst({
      where: {
        senderId,
        receiverId,
        status: FriendStatus.PENDING,
      },
    });

    if (!friendRequest) {
      return {
        success: false,
        message: "Friend request not found or already accepted.",
      };
    }

    await db.userFriend.update({
      where: {
        id: friendRequest.id,
      },
      data: {
        status: FriendStatus.ACCEPTED,
      },
    });

    return {
      success: true,
      message: "Friend request accepted.",
    };
  } catch (error) {
    console.error(
      `Error accepting friend request from ${senderId} to ${receiverId}:`,
      error
    );
    return {
      success: false,
      message: "Error accepting friend request.",
    };
  }
}

export async function rejectFriendRequest(
  senderId: string,
  receiverId: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const friendRequest = await db.userFriend.findFirst({
      where: {
        senderId,
        receiverId,
        status: FriendStatus.PENDING,
      },
    });

    if (!friendRequest) {
      return {
        success: false,
        message: "Friend request not found or already accepted.",
      };
    }

    await db.userFriend.delete({
      where: {
        id: friendRequest.id,
      },
    });

    return {
      success: true,
      message: "Friend request rejected.",
    };
  } catch (error) {
    console.error(
      `Error rejecting friend request from ${senderId} to ${receiverId}:`,
      error
    );
    return {
      success: false,
      message: "Error rejecting friend request.",
    };
  }
}

export async function getFriendStatus(
  userId1: string,
  userId2: string
): Promise<{
  success: boolean;
  message: string;
  status?: FriendStatus;
}> {
  try {
    const friendStatus = await db.userFriend.findFirst({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
    });

    if (!friendStatus) {
      return {
        success: true,
        message: "No friend request or friendship exists.",
      };
    }

    return {
      success: true,
      message: "Friendship status fetched successfully.",
      status: friendStatus.status,
    };
  } catch (error) {
    console.error(
      `Error fetching friend status between ${userId1} and ${userId2}:`,
      error
    );
    return {
      success: false,
      message: "Error fetching friend status.",
    };
  }
}

export async function getUserFriends(userId: string): Promise<{
  success: boolean;
  message: string;
  friends?: { senderId: string; receiverId: string }[];
}> {
  try {
    const friends = await db.userFriend.findMany({
      where: {
        OR: [
          { senderId: userId, status: FriendStatus.ACCEPTED },
          { receiverId: userId, status: FriendStatus.ACCEPTED },
        ],
      },
    });

    return {
      success: true,
      message: "Fetched user friends successfully.",
      friends: friends.map((friend) => ({
        senderId: friend.senderId,
        receiverId: friend.receiverId,
      })),
    };
  } catch (error) {
    console.error(`Error fetching friends for user ${userId}:`, error);
    return {
      success: false,
      message: "Error fetching friends.",
    };
  }
}

export async function removeFriend(
  userId1: string,
  userId2: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const friendStatus = await db.userFriend.findFirst({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
        status: FriendStatus.ACCEPTED,
      },
    });

    if (!friendStatus) {
      return {
        success: false,
        message: "No accepted friendship found.",
      };
    }

    await db.userFriend.delete({
      where: {
        id: friendStatus.id,
      },
    });

    return {
      success: true,
      message: "Friendship removed.",
    };
  } catch (error) {
    console.error(
      `Error removing friend between ${userId1} and ${userId2}:`,
      error
    );
    return {
      success: false,
      message: "Error removing friend.",
    };
  }
}
