import db from "@/lib/db";
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

beforeAll(async () => {
  await db.$connect();
});

beforeEach(async () => {
  await db.notification.deleteMany();
  await db.user.deleteMany();
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await db.$disconnect();
});

const invalid_id = "invalid_id";
const valid_id = new ObjectId().toString();
const userData = {
  name: "Test User",
  email: "testuser@example.com",
};

test("addNotification - successfully adds a notification", async () => {
  const user = await db.user.create({
    data: userData,
  });

  // Now that the user is created, use the user's ID for the notification
  const result = await addNotification({
    title: "New Prayer Request",
    text: "You have a new prayer request to review.",
    type: NotificationType.PRAYER,
    link: "/prayers/1",
    userId: user.id, // Use the created user's ID
    status: NotificationStatusType.UNREAD,
  });

  expect(result.success).toBe(true);
  expect(result.message).toBe("Notification added successfully");
  expect(result.notification).toBeDefined();
  expect(result.notification?.title).toBe("New Prayer Request");
  expect(result.notification?.text).toBe(
    "You have a new prayer request to review."
  );
  expect(result.notification?.userId).toBe(user.id); // Ensure the user ID is correct
});

test("addNotification - returns error when user creation fails", async () => {
  jest
    .spyOn(db.notification, "create")
    .mockRejectedValueOnce(new Error("DB error"));
  const user = await db.user.create({
    data: userData,
  });

  const result = await addNotification({
    title: "New Prayer Request",
    text: "You have a new prayer request to review.",
    type: NotificationType.PRAYER,
    link: "/prayers/1",
    userId: user.id, // Use the created user's ID
    status: NotificationStatusType.UNREAD,
  });

  expect(result.success).toBe(false);
  expect(result.message).toBe("Could not add notification");
  expect(result.notification).toBeNull();
});

test("addNotification - returns error when userId is empty", async () => {
  const result = await addNotification({
    title: "New Prayer Request",
    text: "You have a new prayer request to review.",
    type: NotificationType.PRAYER,
    link: "/prayers/1",
    userId: "",
    status: NotificationStatusType.UNREAD,
  });

  expect(result.success).toBe(false);
  expect(result.message).toBe("Could not add notification");
  expect(result.notification).toBeNull();
});

test("addNotification - successfully adds a notification with default status", async () => {
  const user = await db.user.create({
    data: userData,
  });

  const result = await addNotification({
    title: "New Prayer Request",
    text: "You have a new prayer request to review.",
    type: NotificationType.PRAYER,
    link: "/prayers/1",
    userId: user.id,
  });

  expect(result.success).toBe(true);
  expect(result.message).toBe("Notification added successfully");
  expect(result.notification).toBeDefined();
  expect(result.notification?.status).toBe(NotificationStatusType.UNREAD);
});

test("addNotification - returns error when invalid notification type is provided", async () => {
  const user = await db.user.create({
    data: userData,
  });

  const result = await addNotification({
    title: "New Prayer Request",
    text: "You have a new prayer request to review.",
    type: "INVALID_TYPE" as unknown as NotificationType, // force an invalid type
    link: "/prayers/1",
    userId: user.id,
    status: NotificationStatusType.UNREAD,
  });

  expect(result.success).toBe(false);
  expect(result.message).toBe("Could not add notification");
  expect(result.notification).toBeNull();
});

/* deleteNotification */

test("deleteNotification - successfully deletes notification when notification exists", async () => {
  const createdNotification = await db.notification.create({
    data: {
      title: "New Notification",
      text: "You have a new notification.",
      type: NotificationType.PRAYER,
      link: "/prayers/1",
      userId: "60d1b63f4e6d7f12b8d7c2e3",
    },
  });

  const result = await deleteNotification({ id: createdNotification.id });

  expect(result.success).toBe(true);
  expect(result.message).toBe(`Notification deleted successfully.`);

  // Check if the notification has actually been deleted
  const deletedNotification = await db.notification.findUnique({
    where: { id: createdNotification.id },
  });

  expect(deletedNotification).toBeNull();
});

test("deleteNotification - returns error when notification does not exist", async () => {
  const result = await deleteNotification({ id: valid_id });

  expect(result.success).toBe(false);
  expect(result.message).toBe("Could not delete notification");
});

test("deleteNotification - returns error when given an invalid notification ID format", async () => {
  const result = await deleteNotification({ id: invalid_id });

  expect(result.success).toBe(false);
  expect(result.message).toBe("Invalid ID format");
});

test("deleteNotification - returns error when deletion fails", async () => {
  jest
    .spyOn(db.notification, "delete")
    .mockRejectedValueOnce(new Error("DB error"));

  const createdNotification = await db.notification.create({
    data: {
      title: "New Notification",
      text: "You have a new notification.",
      type: NotificationType.PRAYER,
      link: "/prayers/1",
      userId: valid_id,
    },
  });

  const result = await deleteNotification({ id: createdNotification.id });

  expect(result.success).toBe(false);
  expect(result.message).toBe("Could not delete notification");
});

/* getAllNotificationsForUser */

test("getAllNotificationsForUser - successfully retrieves notifications when user exists", async () => {
  const user = await db.user.create({
    data: {
      name: "Test User",
      email: "testuser@example.com",
    },
  });
  const createdNotifications = await db.notification.createMany({
    data: [
      {
        title: "New Prayer Request",
        text: "You have a new prayer request to review.",
        type: NotificationType.PRAYER,
        link: "/prayers/1",
        userId: user.id,
      },
      {
        title: "New Event",
        text: "You have a new event to attend.",
        type: NotificationType.JOINEDGROUP,
        link: "/events/1",
        userId: user.id,
      },
    ],
  });

  const result = await getAllNotificationsForUser({ userId: user.id });

  expect(result.success).toBe(true);
  expect(result.message).toBe("Notifications retrieved successfully.");
  expect(result.notifications).toHaveLength(createdNotifications.count);
  expect(result.notifications).not.toBeNull();
  expect(result.notifications?.[0].userId).toBe(user.id);
});

test("getAllNotificationsForUser - returns null when user has no notifications", async () => {
  const user = await db.user.create({
    data: {
      name: "Test User",
      email: "testuser@example.com",
    },
  });

  const result = await getAllNotificationsForUser({ userId: user.id });

  expect(result.success).toBe(true);
  expect(result.message).toBe("No notifications found.");
  expect(result.notifications).toBeNull();
});

test("getAllNotificationsForUser - returns error when given an invalid user ID format", async () => {
  const result = await getAllNotificationsForUser({ userId: invalid_id });

  expect(result.success).toBe(false);
  expect(result.message).toBe("Invalid ID format");
  expect(result.notifications).toBeNull();
});

test("getAllNotificationsForUser - returns error when fetching notifications fails", async () => {
  jest
    .spyOn(db.notification, "findMany")
    .mockRejectedValueOnce(new Error("DB error"));

  const user = await db.user.create({
    data: {
      name: "Test User",
      email: "testuser@example.com",
    },
  });

  const result = await getAllNotificationsForUser({ userId: user.id });

  expect(result.success).toBe(false);
  expect(result.message).toBe("Could not retrieve notifications.");
  expect(result.notifications).toBeNull();
});

test("getAllNotificationsForUser - returns notifications in descending order of creation", async () => {
  const user = await db.user.create({
    data: {
      name: "Test User",
      email: "testuser@example.com",
    },
  });

  const createdNotifications = await db.notification.createMany({
    data: [
      {
        title: "Old Notification",
        text: "This is an old notification.",
        type: NotificationType.PRAYER,
        link: "/prayers/1",
        userId: user.id,
        createdAt: new Date(2022, 1, 1),
      },
      {
        title: "New Notification",
        text: "This is a new notification.",
        type: NotificationType.JOINEDGROUP,
        link: "/events/1",
        userId: user.id,
        createdAt: new Date(2023, 1, 1),
      },
    ],
  });

  const result = await getAllNotificationsForUser({ userId: user.id });

  expect(result.success).toBe(true);
  expect(result.message).toBe("Notifications retrieved successfully.");
  expect(result.notifications?.length).toBe(createdNotifications.count);
  const [firstNotification, secondNotification] = result.notifications ?? [];
  expect(firstNotification?.createdAt).toBeInstanceOf(Date);
  expect(secondNotification?.createdAt).toBeInstanceOf(Date);
  expect(firstNotification.createdAt.getTime()).toBeGreaterThan(
    secondNotification.createdAt.getTime()
  );
});

test("getAllNotificationsForUser - returns error when user doesn't exist", async () => {
  const result = await getAllNotificationsForUser({ userId: valid_id });

  expect(result.success).toBe(false);
  expect(result.message).toBe("User not found");
  expect(result.notifications).toBeNull();
});

/* getNotificationCountForUser */

test("getNotificationCountForUser - returns correct count for unread notifications", async () => {
  const user = await db.user.create({
    data: userData,
  });

  await db.notification.createMany({
    data: [
      {
        title: "Notif 1",
        text: "Unread 1",
        type: NotificationType.PRAYER,
        link: "/link1",
        userId: user.id,
        status: NotificationStatusType.UNREAD,
      },
      {
        title: "Notif 2",
        text: "Unread 2",
        type: NotificationType.PRAYER,
        link: "/link2",
        userId: user.id,
        status: NotificationStatusType.UNREAD,
      },
      {
        title: "Notif 3",
        text: "Read",
        type: NotificationType.PRAYER,
        link: "/link3",
        userId: user.id,
        status: NotificationStatusType.READ,
      },
    ],
  });

  const result = await getNotificationCountForUser({ userId: user.id });

  expect(result.success).toBe(true);
  expect(result.count).toBe(2);
});

test("getNotificationCountForUser - returns 0 for user with no notifications", async () => {
  const user = await db.user.create({
    data: userData,
  });

  const result = await getNotificationCountForUser({ userId: user.id });

  expect(result.success).toBe(true);
  expect(result.count).toBe(0);
});

test("getNotificationCountForUser - returns error on invalid user ID format", async () => {
  const result = await getNotificationCountForUser({ userId: invalid_id });

  expect(result.success).toBe(false);
  expect(result.message).toBe("Invalid ID format");
  expect(result.count).toBeNull();
});

test("getNotificationCountForUser - returns error on database failure", async () => {
  jest
    .spyOn(db.notification, "count")
    .mockRejectedValueOnce(new Error("DB error"));

  const result = await getNotificationCountForUser({
    userId: valid_id,
  });

  expect(result.success).toBe(false);
  expect(result.message).toBe("Could not retrieve notification count.");
  expect(result.count).toBeNull();
});

test("markAllNotificationsAsRead - marks unread notifications as read", async () => {
  const user = await db.user.create({
    data: { name: "Test User", email: "test@example.com" },
  });

  await db.notification.createMany({
    data: [
      {
        title: "Unread 1",
        text: "Text 1",
        type: NotificationType.PRAYER,
        link: "/link1",
        userId: user.id,
        status: NotificationStatusType.UNREAD,
      },
      {
        title: "Unread 2",
        text: "Text 2",
        type: NotificationType.PRAYER,
        link: "/link2",
        userId: user.id,
        status: NotificationStatusType.UNREAD,
      },
    ],
  });

  const result = await markAllNotificationsAsRead({ userId: user.id });

  expect(result.success).toBe(true);
  expect(result.message).toBe("All notifications marked as read.");

  const remainingUnread = await db.notification.findMany({
    where: { userId: user.id, status: NotificationStatusType.UNREAD },
  });

  expect(remainingUnread.length).toBe(0);

  const allRead = await db.notification.findMany({
    where: { userId: user.id, status: NotificationStatusType.READ },
  });

  expect(allRead.length).toBe(2);
});

/* markAllNotificationsAsRead */

test("markAllNotificationsAsRead - deletes read notifications older than 7 days", async () => {
  const user = await db.user.create({
    data: { name: "Test User", email: "old@example.com" },
  });

  const oldDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days ago
  const recentDate = new Date(); // now

  await db.notification.createMany({
    data: [
      {
        title: "Old Read",
        text: "Delete me",
        type: NotificationType.PRAYER,
        link: "/old",
        userId: user.id,
        status: NotificationStatusType.READ,
        updatedAt: oldDate,
        createdAt: oldDate,
      },
      {
        title: "Recent Read",
        text: "Keep me",
        type: NotificationType.PRAYER,
        link: "/recent",
        userId: user.id,
        status: NotificationStatusType.READ,
        updatedAt: recentDate,
        createdAt: recentDate,
      },
    ],
  });

  const result = await markAllNotificationsAsRead({ userId: user.id });

  expect(result.success).toBe(true);

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
  });

  expect(notifications.length).toBe(1);
  expect(notifications[0].title).toBe("Recent Read");
});

test("markAllNotificationsAsRead - handles database failure", async () => {
  const user = await db.user.create({
    data: { name: "Test User", email: "old@example.com" },
  });

  jest
    .spyOn(db.notification, "updateMany")
    .mockRejectedValueOnce(new Error("DB fail"));

  const result = await markAllNotificationsAsRead({
    userId: user.id,
  });

  expect(result.success).toBe(false);
  expect(result.message).toBe("Could not mark notifications as read.");
});

test("markAllNotificationsAsRead - fails when userId is invalid format", async () => {
  const result = await markAllNotificationsAsRead({ userId: invalid_id });

  expect(result.success).toBe(false);
  expect(result.message).toBe("Invalid ID format");
});

test("markAllNotificationsAsRead - fails when user does not exist", async () => {
  const result = await markAllNotificationsAsRead({ userId: valid_id });

  expect(result.success).toBe(false);
  expect(result.message).toBe("User not found");
});

/* deleteAllNotificationsForUser */

test("deleteAllNotificationsForUser - handles invalid user ID format gracefully", async () => {
  const result = await deleteAllNotificationsForUser({ userId: invalid_id });

  expect(result.success).toBe(false);
  expect(result.message).toBe("Invalid ID format");
});

test("deleteAllNotificationsForUser - fails when user does not exist", async () => {
  const result = await deleteAllNotificationsForUser({ userId: valid_id });

  expect(result.success).toBe(false);
  expect(result.message).toBe("User not found");
});

test("deleteAllNotificationsForUser - deletes all notifications for a valid user", async () => {
  const user = await db.user.create({ data: userData });

  await db.notification.createMany({
    data: [
      {
        title: "Test 1",
        text: "First notification",
        type: NotificationType.PRAYER,
        link: "/events/1",
        status: "UNREAD",
        userId: user.id,
      },
      {
        title: "Test 2",
        text: "Second notification",
        type: NotificationType.JOINEDGROUP,
        link: "/events/2",
        status: "READ",
        userId: user.id,
      },
    ],
  });

  const result = await deleteAllNotificationsForUser({ userId: user.id });

  expect(result.success).toBe(true);
  expect(result.message).toBe("All notifications deleted.");

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
  });
  expect(notifications.length).toBe(0);
});

test("deleteAllNotificationsForUser - returns failure when DB error occurs", async () => {
  const user = await db.user.create({ data: userData });

  jest
    .spyOn(db.notification, "deleteMany")
    .mockRejectedValueOnce(new Error("Forced DB error"));

  const result = await deleteAllNotificationsForUser({ userId: user.id });

  expect(result.success).toBe(false);
  expect(result.message).toBe("Could not delete notifications.");
});
