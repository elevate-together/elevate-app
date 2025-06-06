// import prisma from "@/lib/prisma";
// import {
//   createUser,
//   clearDatabase,
//   valid_id,
//   invalid_id,
//   createPrayerGroup,
//   linkUserToGroup,
// } from "@/services/test/test.utils";
// import * as groupService from "@/services/prayer-group";
// import * as userService from "@/services/user";
// import * as deviceService from "@/services/device";
// import { NotificationType, User } from "@prisma/client";
// import {
//   sendNotificationAllDevices,
//   sendNotificationToGroups,
//   subscribeDevice,
//   unsubscribeDevice,
// } from "../device";
// import { getUsersInPrayerGroup } from "../user-prayer-group";
// import { getUserById } from "@/services/user";
// import { getAllNotificationsForUser } from "../notification";
// beforeAll(() => db.$connect());
// beforeEach(() => clearDatabase());
// afterEach(() => jest.restoreAllMocks());
// afterAll(() => db.$disconnect());

// jest.mock("next/headers", () => ({
//   headers: jest.fn(() => new Headers()),
// }));

// jest.mock("next/server", () => ({
//   userAgent: jest.fn(() => ({
//     device: { vendor: "TestVendor" },
//     os: { name: "TestOS" },
//   })),
// }));

// /* subscribeDevice */

// describe("subscribeDevice", () => {
//   let user: User;

//   beforeEach(async () => {
//     user = await createUser();
//   });

//   const mockSub = {
//     endpoint: "https://push.service.com/123",
//     keys: {
//       p256dh: "mockP256dhKey",
//       auth: "mockAuthKey",
//     },
//   };

//   test("subscribes device successfully", async () => {
//     const result = await subscribeDevice({
//       sub: mockSub,
//       userId: user.id,
//     });

//     expect(result.success).toBe(true);
//     expect(result.message).toBe("Device subscribed successfully");

//     const device = await prisma.device.findFirst({
//       where: { userId: user.id, endpoint: mockSub.endpoint },
//     });

//     expect(device).toBeTruthy();
//     expect(device?.p256dh).toBe(mockSub.keys.p256dh);
//     expect(device?.auth).toBe(mockSub.keys.auth);
//     expect(device?.title).toBe("TestVendor TestOS");
//   });

//   test("returns error for invalid userId format", async () => {
//     const result = await subscribeDevice({
//       sub: mockSub,
//       userId: invalid_id,
//     });

//     expect(result.success).toBe(false);
//     expect(result.message).toBe("Invalid ID format");
//   });

//   test("returns error when user not found", async () => {
//     const result = await subscribeDevice({
//       sub: mockSub,
//       userId: valid_id, // valid but doesn't exist in DB
//     });

//     expect(result.success).toBe(false);
//     expect(result.message).toBe("User not found");
//   });

//   test("handles DB failure", async () => {
//     jest
//       .spyOn(db.device, "upsert")
//       .mockRejectedValueOnce(new Error("DB error"));

//     const result = await subscribeDevice({
//       sub: mockSub,
//       userId: user.id,
//     });

//     expect(result.success).toBe(false);
//     expect(result.message).toBe("Failed to subscribe device");
//   });
// });

// /* unsubscribeDevice */

// describe("unsubscribeDevice", () => {
//   let user: User;

//   const mockEndpoint = "https://push.service.com/123";
//   const mockDevice = {
//     endpoint: mockEndpoint,
//     p256dh: "mockP256dhKey",
//     auth: "mockAuthKey",
//     title: "Test Device",
//   };

//   beforeEach(async () => {
//     user = await createUser();

//     await prisma.device.create({
//       data: {
//         userId: user.id,
//         ...mockDevice,
//       },
//     });
//   });

//   test("successfully unsubscribes a device", async () => {
//     const result = await unsubscribeDevice({
//       userId: user.id,
//       endpoint: mockEndpoint,
//     });

//     expect(result.success).toBe(true);
//     expect(result.message).toBe("Device unsubscribed successfully");

//     const device = await prisma.device.findFirst({
//       where: { userId: user.id, endpoint: mockEndpoint },
//     });

//     expect(device).toBeNull();
//   });

//   test("returns error for invalid userId format", async () => {
//     const result = await unsubscribeDevice({
//       userId: invalid_id,
//       endpoint: mockEndpoint,
//     });

//     expect(result.success).toBe(false);
//     expect(result.message).toBe("Invalid ID format");
//   });

//   test("returns error when user not found", async () => {
//     const result = await unsubscribeDevice({
//       userId: valid_id,
//       endpoint: mockEndpoint,
//     });

//     expect(result.success).toBe(false);
//     expect(result.message).toBe("User not found");
//   });

//   test("handles DB failure during unsubscribe", async () => {
//     jest
//       .spyOn(db.device, "delete")
//       .mockRejectedValueOnce(new Error("DB error"));

//     const result = await unsubscribeDevice({
//       userId: user.id,
//       endpoint: mockEndpoint,
//     });

//     expect(result.success).toBe(false);
//     expect(result.message).toBe("Failed to unsubscribe device");
//   });
// });

// describe("sendNotificationToGroups", () => {
//   const notificationLink = "/prayer/request/1";

//   test("sends notifications to all group users except sender", async () => {
//     const sender = await createUser({ name: "Sender" });
//     const recipient1 = await createUser({ name: "Recipient1" });
//     const recipient2 = await createUser({ name: "Recipient2" });

//     const group = await createPrayerGroup(sender.id);
//     const group2 = await createPrayerGroup(sender.id);
//     await linkUserToGroup({ prayerGroupId: group.id, userId: recipient1.id });
//     await linkUserToGroup({ prayerGroupId: group2.id, userId: recipient2.id });

//     await sendNotificationToGroups({
//       sharedWithGroups: [{ id: group.id }],
//       userId: sender.id,
//       notificationLink,
//     });

//     const senderNotifications = await getAllNotificationsForUser({
//       userId: sender.id,
//     });

//     const recipient1Notifications = await getAllNotificationsForUser({
//       userId: recipient1.id,
//     });

//     const recipient2Notifications = await getAllNotificationsForUser({
//       userId: recipient2.id,
//     });

//     expect(senderNotifications.notifications).toBeNull();

//     expect(recipient1Notifications.notifications).toHaveLength(1);
//     expect(recipient2Notifications.notifications).toHaveLength(1);
//     expect(recipient1Notifications.notifications?.[0]?.title).toBe(
//       "New Prayer Request"
//     );
//     expect(recipient1Notifications.notifications?.[0]?.link).toBe(
//       notificationLink
//     );
//     expect(recipient2Notifications.notifications?.[0]?.title).toBe(
//       "New Prayer Request"
//     );
//     expect(recipient2Notifications.notifications?.[0]?.link).toBe(
//       notificationLink
//     );
//   });

//   // test("handles missing sender gracefully", async () => {
//   //   const sender = await createUser({ name: "Sender" });
//   //   const recipient = await createUser();

//   //   const group = await createPrayerGroup(sender.id);
//   //   await linkUserToGroup({ prayerGroupId: group.id, userId: recipient.id });

//   //   // Mock the response for getUsersInPrayerGroup
//   //   (getUsersInPrayerGroup as jest.Mock).mockResolvedValue({
//   //     success: true,
//   //     users: [recipient],
//   //   });

//   //   // Mock the response for getUserById when sender is missing
//   //   (userService.getUserById as jest.Mock).mockResolvedValue({ user: null }); // Simulate missing sender

//   //   // Mock the sendNotification function
//   //   const spySendNotification = jest.spyOn(
//   //     deviceService,
//   //     "sendNotificationAllDevices"
//   //   );

//   //   await sendNotificationToGroups({
//   //     sharedWithGroups: [{ id: group.id }],
//   //     userId: sender.id,
//   //     notificationLink,
//   //   });

//   //   // Verify that the notification was sent with "Someone" as sender
//   //   expect(spySendNotification).toHaveBeenCalledWith(
//   //     recipient.id,
//   //     "Someone shared a prayer request with you!",
//   //     NotificationType.PRAYER,
//   //     notificationLink,
//   //     "New Prayer Request"
//   //   );
//   // });
// });
