import prisma from "@/lib/prisma";
import { NotificationStatusType, NotificationType } from "@prisma/client";
import {
  addNotification,
  deleteAllNotificationsForUser,
  deleteNotification,
  getAllNotificationsForUser,
  getNotificationCountForUser,
  markAllNotificationsAsRead,
} from "@/services/notification";
import { ObjectId } from "mongodb";

const invalid_id = "invalid_id";
const valid_id = new ObjectId().toString();
const userData = {
  name: "Test User",
  email: "testuser@example.com",
};

async function createTestUser(data = userData) {
  return db.user.create({ data });
}

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await prisma.$disconnect();
});

/* addNotification */
describe("addNotification", () => {
  test("successfully adds a notification", async () => {
    const user = await createTestUser();

    const result = await addNotification({
      title: "New Prayer Request",
      text: "You have a new prayer request to review.",
      type: NotificationType.PRAYER,
      link: "/prayers/1",
      userId: user.id,
      status: NotificationStatusType.UNREAD,
    });

    expect(result.success).toBe(true);
    expect(result.notification?.title).toBe("New Prayer Request");
  });

  test("returns error when db.create fails", async () => {
    jest
      .spyOn(db.notification, "create")
      .mockRejectedValueOnce(new Error("DB error"));
    const user = await createTestUser();

    const result = await addNotification({
      title: "Test",
      text: "Text",
      type: NotificationType.PRAYER,
      link: "/link",
      userId: user.id,
      status: NotificationStatusType.UNREAD,
    });

    expect(result.success).toBe(false);
    expect(result.notification).toBeNull();
  });

  test("returns error when userId is empty", async () => {
    const result = await addNotification({
      title: "Test",
      text: "Text",
      type: NotificationType.PRAYER,
      link: "/link",
      userId: "",
      status: NotificationStatusType.UNREAD,
    });

    expect(result.success).toBe(false);
  });

  test("successfully adds notification with default status", async () => {
    const user = await createTestUser();

    const result = await addNotification({
      title: "Default Status",
      text: "Text",
      type: NotificationType.PRAYER,
      link: "/link",
      userId: user.id,
    });

    expect(result.notification?.status).toBe(NotificationStatusType.UNREAD);
  });

  test("returns error on invalid notification type", async () => {
    const user = await createTestUser();

    const result = await addNotification({
      title: "Invalid Type",
      text: "Text",
      type: "INVALID_TYPE" as NotificationType,
      link: "/link",
      userId: user.id,
      status: NotificationStatusType.UNREAD,
    });

    expect(result.success).toBe(false);
  });
});

/* deleteNotification */

describe("deleteNotification", () => {
  test("successfully deletes existing notification", async () => {
    const notification = await prisma.notification.create({
      data: {
        title: "To Delete",
        text: "Text",
        type: NotificationType.PRAYER,
        link: "/link",
        userId: valid_id,
      },
    });

    const result = await deleteNotification({ id: notification.id });

    expect(result.success).toBe(true);
    expect(
      await prisma.notification.findUnique({ where: { id: notification.id } })
    ).toBeNull();
  });

  test("returns error when notification doesn't exist", async () => {
    const result = await deleteNotification({ id: valid_id });

    expect(result.success).toBe(false);
  });

  test("returns error on invalid ID format", async () => {
    const result = await deleteNotification({ id: invalid_id });

    expect(result.success).toBe(false);
  });

  test("returns error on DB failure", async () => {
    const notification = await prisma.notification.create({
      data: {
        title: "To Fail",
        text: "Text",
        type: NotificationType.PRAYER,
        link: "/link",
        userId: valid_id,
      },
    });

    jest
      .spyOn(db.notification, "delete")
      .mockRejectedValueOnce(new Error("DB error"));

    const result = await deleteNotification({ id: notification.id });

    expect(result.success).toBe(false);
  });
});

/* getAllNotificationsForUser */

describe("getAllNotificationsForUser", () => {
  test("retrieves notifications for existing user", async () => {
    const user = await createTestUser();
    const created = await prisma.notification.createMany({
      data: [
        {
          title: "One",
          text: "First",
          type: NotificationType.PRAYER,
          link: "/1",
          userId: user.id,
        },
        {
          title: "Two",
          text: "Second",
          type: NotificationType.JOINEDGROUP,
          link: "/2",
          userId: user.id,
        },
      ],
    });

    const result = await getAllNotificationsForUser({ userId: user.id });

    expect(result.success).toBe(true);
    expect(result.notifications).toHaveLength(created.count);
  });

  test("returns null if user has no notifications", async () => {
    const user = await createTestUser();

    const result = await getAllNotificationsForUser({ userId: user.id });

    expect(result.success).toBe(true);
    expect(result.notifications).toBeNull();
  });

  test("returns error on invalid user ID", async () => {
    const result = await getAllNotificationsForUser({ userId: invalid_id });

    expect(result.success).toBe(false);
  });

  test("returns error on DB failure", async () => {
    const user = await createTestUser();
    jest
      .spyOn(db.notification, "findMany")
      .mockRejectedValueOnce(new Error("DB error"));

    const result = await getAllNotificationsForUser({ userId: user.id });

    expect(result.success).toBe(false);
  });

  test("returns notifications in descending order", async () => {
    const user = await createTestUser();

    await prisma.notification.createMany({
      data: [
        {
          title: "Old",
          text: "Past",
          type: NotificationType.PRAYER,
          link: "/old",
          userId: user.id,
          createdAt: new Date(2022, 1, 1),
        },
        {
          title: "New",
          text: "Recent",
          type: NotificationType.JOINEDGROUP,
          link: "/new",
          userId: user.id,
          createdAt: new Date(2023, 1, 1),
        },
      ],
    });

    const result = await getAllNotificationsForUser({ userId: user.id });

    if (result.notifications) {
      expect(
        result.notifications?.[0].createdAt.getTime() >
          result.notifications?.[1].createdAt.getTime()
      ).toBe(true);
    }
  });

  test("returns error when user doesn't exist", async () => {
    const result = await getAllNotificationsForUser({ userId: valid_id });

    expect(result.success).toBe(false);
  });
});

/* getNotificationCountForUser */

describe("getNotificationCountForUser", () => {
  test("returns correct unread count", async () => {
    const user = await createTestUser();

    await prisma.notification.createMany({
      data: [
        {
          title: "1",
          text: "Unread",
          type: NotificationType.PRAYER,
          link: "/1",
          userId: user.id,
          status: NotificationStatusType.UNREAD,
        },
        {
          title: "2",
          text: "Read",
          type: NotificationType.PRAYER,
          link: "/2",
          userId: user.id,
          status: NotificationStatusType.READ,
        },
        {
          title: "3",
          text: "Unread",
          type: NotificationType.PRAYER,
          link: "/3",
          userId: user.id,
          status: NotificationStatusType.UNREAD,
        },
      ],
    });

    const result = await getNotificationCountForUser({ userId: user.id });

    expect(result.count).toBe(2);
  });

  test("returns 0 for user with no notifications", async () => {
    const user = await createTestUser();

    const result = await getNotificationCountForUser({ userId: user.id });

    expect(result.count).toBe(0);
  });

  test("returns error on invalid user ID", async () => {
    const result = await getNotificationCountForUser({ userId: invalid_id });

    expect(result.success).toBe(false);
  });

  test("returns error on DB failure", async () => {
    jest
      .spyOn(db.notification, "count")
      .mockRejectedValueOnce(new Error("DB error"));

    const result = await getNotificationCountForUser({ userId: valid_id });

    expect(result.success).toBe(false);
  });
});

/* markAllNotificationsAsRead */

describe("markAllNotificationsAsRead", () => {
  test("marks all unread as read", async () => {
    const user = await createTestUser();

    await prisma.notification.createMany({
      data: [
        {
          title: "Unread 1",
          text: "Text",
          type: NotificationType.PRAYER,
          link: "/1",
          userId: user.id,
          status: NotificationStatusType.UNREAD,
        },
        {
          title: "Unread 2",
          text: "Text",
          type: NotificationType.PRAYER,
          link: "/2",
          userId: user.id,
          status: NotificationStatusType.UNREAD,
        },
      ],
    });

    const result = await markAllNotificationsAsRead({ userId: user.id });

    expect(result.success).toBe(true);

    const unread = await prisma.notification.findMany({
      where: { userId: user.id, status: NotificationStatusType.UNREAD },
    });

    expect(unread).toHaveLength(0);
  });

  test("deletes old read notifications", async () => {
    const user = await createTestUser();

    const old = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    const now = new Date();

    await prisma.notification.createMany({
      data: [
        {
          title: "Old",
          text: "Delete",
          type: NotificationType.PRAYER,
          link: "/old",
          userId: user.id,
          status: NotificationStatusType.READ,
          updatedAt: old,
          createdAt: old,
        },
        {
          title: "New",
          text: "Keep",
          type: NotificationType.PRAYER,
          link: "/new",
          userId: user.id,
          status: NotificationStatusType.READ,
          updatedAt: now,
          createdAt: now,
        },
      ],
    });

    const result = await markAllNotificationsAsRead({ userId: user.id });

    expect(result.success).toBe(true);
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
    });
    expect(notifications.length).toBe(1);
    expect(notifications[0].title).toBe("New");
  });

  test("fails on db error", async () => {
    const user = await createTestUser();

    jest
      .spyOn(db.notification, "updateMany")
      .mockRejectedValueOnce(new Error("DB error"));

    const result = await markAllNotificationsAsRead({ userId: user.id });

    expect(result.success).toBe(false);
  });

  test("fails on invalid user ID", async () => {
    const result = await markAllNotificationsAsRead({ userId: invalid_id });

    expect(result.success).toBe(false);
  });

  test("fails if user not found", async () => {
    const result = await markAllNotificationsAsRead({ userId: valid_id });

    expect(result.success).toBe(false);
  });
});

/* deleteAllNotificationsForUser */

describe("deleteAllNotificationsForUser", () => {
  test("fails on invalid ID", async () => {
    const result = await deleteAllNotificationsForUser({ userId: invalid_id });

    expect(result.success).toBe(false);
  });

  test("fails if user not found", async () => {
    const result = await deleteAllNotificationsForUser({ userId: valid_id });

    expect(result.success).toBe(false);
  });

  test("deletes all user notifications", async () => {
    const user = await createTestUser();

    await prisma.notification.createMany({
      data: [
        {
          title: "1",
          text: "Text",
          type: NotificationType.PRAYER,
          link: "/1",
          userId: user.id,
          status: NotificationStatusType.UNREAD,
        },
        {
          title: "2",
          text: "Text",
          type: NotificationType.JOINEDGROUP,
          link: "/2",
          userId: user.id,
          status: NotificationStatusType.READ,
        },
      ],
    });

    const result = await deleteAllNotificationsForUser({ userId: user.id });

    expect(result.success).toBe(true);

    const remaining = await prisma.notification.findMany({
      where: { userId: user.id },
    });

    expect(remaining).toHaveLength(0);
  });

  test("fails on db error", async () => {
    const user = await createTestUser();

    jest
      .spyOn(db.notification, "deleteMany")
      .mockRejectedValueOnce(new Error("DB error"));

    const result = await deleteAllNotificationsForUser({ userId: user.id });

    expect(result.success).toBe(false);
  });
});
