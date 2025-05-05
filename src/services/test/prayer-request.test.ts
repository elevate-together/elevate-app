import db from "@/lib/db";
import {
  GroupStatus,
  NotificationType,
  PrayerGroup,
  PrayerRequest,
  ShareType,
  User,
} from "@prisma/client";
import { PrayerRequestStatus, PrayerVisibility } from "@prisma/client";
import {
  createPrayerRequest,
  deletePrayerRequest,
  getPrayerRequestById,
  getAllPrayerRequestsByUserId,
  updatePrayerRequest,
  getInProgressPrayerRequestsForUser,
  updatePrayerRequestStatus,
  getUserPrayerRequestsVisibleUser,
} from "../prayer-request";

import {
  createUser as createUser,
  createPrayerGroup,
  createUser2,
  getPrayerRequestData,
  clearDatabase,
  valid_id,
  invalid_id,
  linkUserToGroup,
  createTestPrayerRequest,
  ShareWith,
  sharePrayerRequestWithGroup,
} from "@/services/test/test.utils";
import { getAllNotificationsForUser } from "../notification";

beforeAll(() => db.$connect());
beforeEach(() => clearDatabase());
afterEach(() => jest.restoreAllMocks());
afterAll(() => db.$disconnect());

const sharedWithPrivate: ShareWith[] = [{ type: "private", id: "2" }];
const sharedWithPublic: ShareWith[] = [{ type: "public", id: "1" }];
export function createGroupShareWithList(groupIds: string[]): ShareWith[] {
  return groupIds.map((id) => ({
    type: "group",
    id,
  }));
}

/* getPrayerRequestById */

describe("getPrayerRequestById", () => {
  let user: User;

  beforeEach(async () => {
    user = await createUser();
  });

  test("returns prayer request successfully by ID", async () => {
    const prayerRequest = await createTestPrayerRequest(user);

    const result = await getPrayerRequestById({ id: prayerRequest.id });

    expect(result.success).toBe(true);
    expect(result.prayerRequest?.id).toBe(prayerRequest.id);
    expect(result.message).toBe("Prayer request found");
  });

  test("returns not found when prayer request does not exist", async () => {
    const result = await getPrayerRequestById({ id: valid_id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Prayer request not found");
    expect(result.prayerRequest).toBeNull();
  });

  test("returns error for invalid ID format", async () => {
    const result = await getPrayerRequestById({ id: invalid_id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid ID format");
    expect(result.prayerRequest).toBeNull();
  });

  test("handles error during fetch", async () => {
    const prayerRequest = await createTestPrayerRequest(user);

    jest
      .spyOn(db.prayerRequest, "findUnique")
      .mockRejectedValueOnce(new Error("DB error"));

    const result = await getPrayerRequestById({ id: prayerRequest.id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Error fetching prayer request by ID");
    expect(result.prayerRequest).toBeNull();
  });
});

/* createPrayerRequest */

describe("createPrayerRequest", () => {
  let user: User;

  beforeEach(async () => {
    user = await createUser();
  });

  test("returns public prayer request successfully by ID", async () => {
    const prayerData = getPrayerRequestData(user, sharedWithPublic);

    const result = await createPrayerRequest(prayerData);

    expect(result.success).toBe(true);
    expect(result.prayerRequest?.request).toBe("Test prayer request");
    expect(result.prayerRequest?.status).toBe(PrayerRequestStatus.IN_PROGRESS);
    expect(result.prayerRequest?.visibility).toBe(PrayerVisibility.PUBLIC);
    expect(result.prayerRequest?.userId).toBe(user.id);
    expect(result.message).toBe("Successfully added prayer request");
  });

  test("returns private prayer request successfully by ID", async () => {
    const prayerData = getPrayerRequestData(user, sharedWithPrivate);

    const result = await createPrayerRequest(prayerData);

    expect(result.success).toBe(true);
    expect(result.prayerRequest?.request).toBe("Test prayer request");
    expect(result.prayerRequest?.status).toBe(PrayerRequestStatus.IN_PROGRESS);
    expect(result.prayerRequest?.visibility).toBe(PrayerVisibility.PRIVATE);
    expect(result.prayerRequest?.userId).toBe(user.id);
    expect(result.message).toBe("Successfully added prayer request");
  });

  test("returns group prayer request successfully by ID", async () => {
    const prayerGroup = await createPrayerGroup(user.id);
    await linkUserToGroup({ userId: user.id, prayerGroupId: prayerGroup.id });

    const shareWithGroup = createGroupShareWithList([prayerGroup.id]);
    const prayerData = getPrayerRequestData(user, shareWithGroup);

    const result = await createPrayerRequest(prayerData);

    const shares = await db.prayerRequestShare.findMany({
      where: {
        ownerId: user.id,
        sharedWithId: prayerGroup.id,
        sharedWithType: ShareType.GROUP,
      },
    });

    expect(result.success).toBe(true);
    expect(result.prayerRequest?.request).toBe("Test prayer request");
    expect(result.prayerRequest?.status).toBe(PrayerRequestStatus.IN_PROGRESS);
    expect(result.prayerRequest?.visibility).toBe(PrayerVisibility.SHARED);
    expect(result.prayerRequest?.userId).toBe(user.id);
    expect(result.message).toBe("Successfully added prayer request");

    expect(shares.length).toBe(1);
    expect(shares[0].sharedWithId).toBe(prayerGroup.id);
    expect(shares[0].sharedWithType).toBe(ShareType.GROUP);
  });

  // test("fails to share with an invalid object group ID", async () => {
  //
  //   const shareWithGroup = createGroupShareWithList([valid_id]);

  //   const prayerData = getPrayerRequestData(user, shareWithGroup);
  //   const result = await createPrayerRequest(prayerData);

  //   expect(result.success).toBe(false);
  //   expect(result.message).toContain("Some group(s) ID(s) not found");
  // });

  test("fails to share with an invalid object group ID", async () => {
    const shareWithGroup = createGroupShareWithList([invalid_id]);

    const prayerData = getPrayerRequestData(user, shareWithGroup);
    const result = await createPrayerRequest(prayerData);

    expect(result.success).toBe(false);
    expect(result.message).toContain("Invalid group ID(s) type provided");
  });

  test("sends notification to self when notify is true", async () => {
    const prayerData = getPrayerRequestData(user, sharedWithPrivate);

    const result = await createPrayerRequest(prayerData);

    expect(result.success).toBe(true);

    const getNotifications = await getAllNotificationsForUser({
      userId: user.id,
    });

    expect(result.success).toBe(true);
    expect(result.prayerRequest?.request).toBe("Test prayer request");
    expect(result.prayerRequest?.visibility).toBe(PrayerVisibility.PRIVATE);

    expect(getNotifications.success).toBe(true);
    expect(getNotifications.notifications?.length).toBe(1);
    expect(
      getNotifications.notifications &&
        getNotifications.notifications.length > 0
        ? getNotifications.notifications[0].title
        : null
    ).toBe("New Prayer Request");
    expect(
      getNotifications.notifications &&
        getNotifications.notifications.length > 0
        ? getNotifications.notifications[0].text
        : null
    ).toBe("You just added a new private prayer request.");
    expect(
      getNotifications.notifications &&
        getNotifications.notifications.length > 0
        ? getNotifications.notifications[0].type
        : null
    ).toBe(NotificationType.PRAYER);
  });

  test("sends notification to friend in group when notify is true", async () => {
    const user2 = await createUser2();

    const prayerGroup = await createPrayerGroup(user2.id);

    await linkUserToGroup({ userId: user.id, prayerGroupId: prayerGroup.id });
    await linkUserToGroup({ userId: user2.id, prayerGroupId: prayerGroup.id });

    const prayerData = getPrayerRequestData(user, sharedWithPublic);
    const result = await createPrayerRequest(prayerData);

    const getNotifications = await getAllNotificationsForUser({
      userId: user2.id,
    });

    expect(result.success).toBe(true);
    expect(result.prayerRequest?.request).toBe("Test prayer request");
    expect(result.prayerRequest?.visibility).toBe(PrayerVisibility.PUBLIC);

    expect(getNotifications.success).toBe(true);
    expect(getNotifications.notifications?.length).toBe(1);
    expect(
      getNotifications.notifications &&
        getNotifications.notifications.length > 0
        ? getNotifications.notifications[0].type
        : null
    ).toBe(NotificationType.PRAYER);
  });

  test("does not send notification to friend in group when notify is false", async () => {
    const user2 = await createUser2();

    const prayerGroup = await createPrayerGroup(user2.id);

    await linkUserToGroup({ userId: user.id, prayerGroupId: prayerGroup.id });
    await linkUserToGroup({ userId: user2.id, prayerGroupId: prayerGroup.id });

    const prayerData = getPrayerRequestData(user, sharedWithPublic, {
      notify: false,
    });
    const result = await createPrayerRequest(prayerData);

    const getNotifications = await getAllNotificationsForUser({
      userId: user2.id,
    });

    expect(result.success).toBe(true);
    expect(result.prayerRequest?.request).toBe("Test prayer request");
    expect(result.prayerRequest?.visibility).toBe(PrayerVisibility.PUBLIC);

    expect(getNotifications.success).toBe(true);
    expect(getNotifications.notifications).toBeNull();
  });

  test("does not send notification to friend in group when private", async () => {
    const user2 = await createUser2();

    const prayerGroup = await createPrayerGroup(user2.id);

    await linkUserToGroup({ userId: user.id, prayerGroupId: prayerGroup.id });
    await linkUserToGroup({ userId: user2.id, prayerGroupId: prayerGroup.id });

    const prayerData = getPrayerRequestData(user, sharedWithPrivate, {
      notify: false,
    });
    const result = await createPrayerRequest(prayerData);

    const getNotifications = await getAllNotificationsForUser({
      userId: user2.id,
    });

    expect(result.success).toBe(true);
    expect(result.prayerRequest?.request).toBe("Test prayer request");
    expect(result.prayerRequest?.visibility).toBe(PrayerVisibility.PRIVATE);

    expect(getNotifications.success).toBe(true);
    expect(getNotifications.notifications).toBeNull();
  });

  test("does not send notification to friend not accepted into a group", async () => {
    const user2 = await createUser2();

    const prayerGroup = await createPrayerGroup(user2.id);

    await linkUserToGroup({ userId: user.id, prayerGroupId: prayerGroup.id });
    await linkUserToGroup({
      userId: user2.id,
      prayerGroupId: prayerGroup.id,
      groupStatus: GroupStatus.PENDING,
    });

    const prayerData = getPrayerRequestData(user, sharedWithPublic);
    const result = await createPrayerRequest(prayerData);

    const getNotifications = await getAllNotificationsForUser({
      userId: user2.id,
    });

    expect(result.success).toBe(true);
    expect(result.prayerRequest?.request).toBe("Test prayer request");
    expect(result.prayerRequest?.visibility).toBe(PrayerVisibility.PUBLIC);

    expect(getNotifications.success).toBe(true);
    expect(getNotifications.notifications).toBeNull();
  });

  test("returns multiple group prayer request successfully by ID", async () => {
    const prayerGroup1 = await createPrayerGroup(user.id);
    const prayerGroup2 = await createPrayerGroup(user.id);

    const shareWithGroups = createGroupShareWithList([
      prayerGroup1.id,
      prayerGroup2.id,
    ]);
    const prayerData = getPrayerRequestData(user, shareWithGroups);

    const result = await createPrayerRequest(prayerData);

    const shares = await db.prayerRequestShare.findMany({
      where: {
        ownerId: user.id,
        sharedWithType: ShareType.GROUP,
      },
    });

    expect(result.success).toBe(true);
    expect(shares.length).toBe(2);
  });
});

/* updatePrayerRequest */

describe("updatePrayerRequest", () => {
  let user: User;
  let prayerRequest: PrayerRequest;
  let group: PrayerGroup;

  beforeEach(async () => {
    user = await createUser();

    const result = await createPrayerRequest({
      request: "Initial prayer request",
      userId: user.id,
      notify: false,
      sharedWith: [{ type: "public", id: "1" }],
    });

    if (result.success && result.prayerRequest) {
      prayerRequest = result.prayerRequest;
    } else {
      throw new Error("Failed to create initial prayer request");
    }
  });

  test("updates prayer request successfully", async () => {
    const newRequestData = {
      request: "Updated prayer request",
      status: PrayerRequestStatus.IN_PROGRESS,
      sharedWith: [{ type: "private", id: "2" }],
    };

    const result = await updatePrayerRequest({
      id: prayerRequest.id,
      requestData: newRequestData,
      userId: user.id,
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Prayer request updated successfully");
    expect(result.prayerRequest?.request).toBe("Updated prayer request");
    expect(result.prayerRequest?.status).toBe(PrayerRequestStatus.IN_PROGRESS);
    expect(result.prayerRequest?.visibility).toBe(PrayerVisibility.PRIVATE);
  });

  test("returns error if prayer request not found", async () => {
    const result = await updatePrayerRequest({
      id: valid_id,
      requestData: {
        request: "Updated prayer request",
        status: PrayerRequestStatus.IN_PROGRESS,
        sharedWith: [],
      },
      userId: user.id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Prayer request not found");
  });

  test("returns error for invalid prayer request ID format", async () => {
    const result = await updatePrayerRequest({
      id: invalid_id,
      requestData: {
        request: "Updated prayer request",
        status: PrayerRequestStatus.IN_PROGRESS,
        sharedWith: [],
      },
      userId: user.id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid ID format");
  });

  test("adds new shared group correctly", async () => {
    group = await createPrayerGroup(user.id);
    await linkUserToGroup({ userId: user.id, prayerGroupId: group.id });

    const newRequestData = {
      request: "Updated prayer request with new group",
      status: PrayerRequestStatus.IN_PROGRESS,
      sharedWith: createGroupShareWithList([group.id]),
    };

    const result = await updatePrayerRequest({
      id: prayerRequest.id,
      requestData: newRequestData,
      userId: user.id,
    });

    const updatedPrayerRequest = result.prayerRequest;

    expect(result.success).toBe(true);
    expect(updatedPrayerRequest?.visibility).toBe(PrayerVisibility.SHARED);
    expect(updatedPrayerRequest?.request).toBe(
      "Updated prayer request with new group"
    );

    const shares = await db.prayerRequestShare.findMany({
      where: { prayerRequestId: updatedPrayerRequest?.id },
    });

    expect(shares.some((share) => share.sharedWithId === group.id)).toBe(true);
  });

  test("removes shared group correctly", async () => {
    group = await createPrayerGroup(user.id);
    await linkUserToGroup({ userId: user.id, prayerGroupId: group.id });

    const group2 = await createPrayerGroup(user.id);

    await updatePrayerRequest({
      id: prayerRequest.id,
      requestData: {
        request: "Prayer request to remove group",
        status: PrayerRequestStatus.IN_PROGRESS,
        sharedWith: createGroupShareWithList([group.id]),
      },
      userId: user.id,
    });

    const resultAfterRemoval = await updatePrayerRequest({
      id: prayerRequest.id,
      requestData: {
        request: "Updated prayer request without group",
        status: PrayerRequestStatus.IN_PROGRESS,
        sharedWith: createGroupShareWithList([group2.id]),
      },
      userId: user.id,
    });

    const updatedPrayerRequest = resultAfterRemoval.prayerRequest;

    expect(resultAfterRemoval.success).toBe(true);
    expect(updatedPrayerRequest?.visibility).toBe(PrayerVisibility.SHARED);
    expect(updatedPrayerRequest?.request).toBe(
      "Updated prayer request without group"
    );

    const shares = await db.prayerRequestShare.findMany({
      where: { prayerRequestId: updatedPrayerRequest?.id },
    });

    expect(shares.some((share) => share.sharedWithId === group.id)).toBe(false);
  });

  test("updates visibility based on shared types", async () => {
    const newRequestData = {
      request: "Updated prayer request for visibility check",
      status: PrayerRequestStatus.IN_PROGRESS,
      sharedWith: [{ type: "private", id: "2" }],
    };

    const result = await updatePrayerRequest({
      id: prayerRequest.id,
      requestData: newRequestData,
      userId: user.id,
    });

    expect(result.success).toBe(true);
    expect(result.prayerRequest?.visibility).toBe(PrayerVisibility.PRIVATE);
  });

  test("handles errors gracefully during database operations", async () => {
    jest
      .spyOn(db.prayerRequest, "findUnique")
      .mockRejectedValueOnce(new Error("DB error"));

    const result = await updatePrayerRequest({
      id: prayerRequest.id,
      requestData: {
        request: "Updated prayer request",
        status: PrayerRequestStatus.IN_PROGRESS,
        sharedWith: [],
      },
      userId: user.id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Error updating prayer request");
  });
});

/* deletePrayerRequest */

describe("deletePrayerRequest", () => {
  let user: User;
  let prayerRequest: PrayerRequest;

  beforeEach(async () => {
    user = await createUser();

    const result = await createPrayerRequest({
      request: "Initial prayer request to delete",
      userId: user.id,
      notify: false,
      sharedWith: [{ type: "public", id: "1" }],
    });

    if (!result.success || !result.prayerRequest) {
      throw new Error("Failed to create prayer request for deletion");
    }

    prayerRequest = result.prayerRequest;
  });

  test("successfully deletes a prayer request by ID", async () => {
    const result = await deletePrayerRequest({ id: prayerRequest.id });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Prayer request deleted successfully");

    const deleted = await db.prayerRequest.findUnique({
      where: { id: prayerRequest.id },
    });
    expect(deleted).toBeNull();
  });

  test("returns not found for non-existent ID", async () => {
    const result = await deletePrayerRequest({ id: valid_id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Prayer request not found");
  });

  test("returns error for invalid ID format", async () => {
    const result = await deletePrayerRequest({ id: invalid_id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid ID format");
  });

  test("handles errors gracefully during database operations", async () => {
    jest
      .spyOn(db.prayerRequest, "delete")
      .mockRejectedValueOnce(new Error("DB error"));

    const result = await deletePrayerRequest({ id: prayerRequest.id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Error deleting prayer request");
  });
});

/* getAllPrayerRequestsByUserId */

describe("getAllPrayerRequestsByUserId", () => {
  let user: User;
  let prayerRequest: PrayerRequest;

  beforeEach(async () => {
    user = await createUser();

    const result = await createPrayerRequest({
      request: "User's prayer request",
      userId: user.id,
      notify: false,
      sharedWith: [{ type: "public", id: "1" }],
    });

    if (!result.success || !result.prayerRequest) {
      throw new Error("Failed to create initial prayer request");
    }

    prayerRequest = result.prayerRequest;
  });

  test("successfully returns prayer requests for a valid user", async () => {
    const result = await getAllPrayerRequestsByUserId({ userId: user.id });

    expect(result.success).toBe(true);
    expect(result.message).toBe(
      "Successfully fetched prayer requests for this user"
    );
    expect(result.prayerRequests).not.toBeNull();
    expect(result.prayerRequests?.length).toBe(1);
    expect(result.prayerRequests?.[0].id).toBe(prayerRequest.id);
  });

  test("returns no prayer requests when user has none", async () => {
    const emptyUser = await createUser();
    const result = await getAllPrayerRequestsByUserId({ userId: emptyUser.id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("No prayer requests found for this user");
    expect(result.prayerRequests).toBeNull();
  });

  test("returns user not found for non-existent user ID", async () => {
    const result = await getAllPrayerRequestsByUserId({ userId: valid_id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("User not found");
    expect(result.prayerRequests).toBeNull();
  });

  test("returns error for invalid ID format", async () => {
    const result = await getAllPrayerRequestsByUserId({ userId: invalid_id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid ID format");
    expect(result.prayerRequests).toBeNull();
  });

  test("returns prayer request with different status", async () => {
    await createPrayerRequest({
      request: "Initial prayer request to delete",
      userId: user.id,
      notify: false,
      sharedWith: [{ type: "public", id: "1" }],
      status: PrayerRequestStatus.ARCHIVED,
    });

    await createPrayerRequest({
      request: "Initial prayer request to delete",
      userId: user.id,
      notify: false,
      sharedWith: [{ type: "private", id: "2" }],
      status: PrayerRequestStatus.ANSWERED,
    });

    const result = await getAllPrayerRequestsByUserId({ userId: user.id });

    expect(result.success).toBe(true);
    expect(result.prayerRequests?.length).toBe(3);
  });

  test("handles database error gracefully", async () => {
    jest
      .spyOn(db.prayerRequest, "findMany")
      .mockRejectedValueOnce(new Error("DB failure"));

    const result = await getAllPrayerRequestsByUserId({ userId: user.id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Error fetching prayer requests for the user");
    expect(result.prayerRequests).toBeNull();
  });
});

/* getInProgressPrayerRequestsForUser */

describe("getInProgressPrayerRequestsForUser", () => {
  let user: User;
  let inProgressPrayer: PrayerRequest;

  beforeEach(async () => {
    user = await createUser();

    const result = await createPrayerRequest({
      request: "In-progress prayer request",
      userId: user.id,
      notify: false,
      sharedWith: [{ type: "public", id: "1" }],
      status: PrayerRequestStatus.IN_PROGRESS,
    });

    if (!result.success || !result.prayerRequest) {
      throw new Error("Failed to create in-progress prayer request");
    }

    inProgressPrayer = result.prayerRequest;
  });

  test("returns in-progress prayer requests for valid user", async () => {
    const result = await getInProgressPrayerRequestsForUser({
      userId: user.id,
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe(
      "Successfully fetched prayer requests for this user"
    );
    expect(result.prayerRequests).not.toBeNull();
    expect(result.prayerRequests?.length).toBe(1);
    expect(result.prayerRequests?.[0].id).toBe(inProgressPrayer.id);
    expect(result.prayerRequests?.[0].user.id).toBe(user.id); // includes user
  });

  test("returns empty list when user has no in-progress requests", async () => {
    const anotherUser = await createUser();
    const result = await getInProgressPrayerRequestsForUser({
      userId: anotherUser.id,
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("No prayer requests found for this user");
    expect(result.prayerRequests).toEqual([]);
  });

  test("returns only in progress requests", async () => {
    await createPrayerRequest({
      request: "In-progress prayer request",
      userId: user.id,
      notify: false,
      sharedWith: [{ type: "public", id: "1" }],
      status: PrayerRequestStatus.ANSWERED,
    });

    await createPrayerRequest({
      request: "In-progress prayer request",
      userId: user.id,
      notify: false,
      sharedWith: [{ type: "public", id: "1" }],
      status: PrayerRequestStatus.ARCHIVED,
    });

    const result = await getInProgressPrayerRequestsForUser({
      userId: user.id,
    });

    expect(result.success).toBe(true);
    expect(result.prayerRequests?.length).toBe(1);
    expect(result.prayerRequests?.[0].id).toBe(inProgressPrayer.id);
  });

  test("returns error when user ID is invalid format", async () => {
    const result = await getInProgressPrayerRequestsForUser({
      userId: invalid_id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid ID format");
    expect(result.prayerRequests).toBeNull();
  });

  test("returns error when user does not exist", async () => {
    const result = await getInProgressPrayerRequestsForUser({
      userId: valid_id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("User not found");
    expect(result.prayerRequests).toBeNull();
  });

  test("handles database errors gracefully", async () => {
    jest
      .spyOn(db.prayerRequest, "findMany")
      .mockRejectedValueOnce(new Error("DB failure"));

    const result = await getInProgressPrayerRequestsForUser({
      userId: user.id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Error fetching prayer requests for the user");
    expect(result.prayerRequests).toBeNull();
  });
});

/* updatePrayerRequestStatus */

describe("updatePrayerRequestStatus", () => {
  let user: User;
  let prayerRequest: PrayerRequest;

  beforeEach(async () => {
    user = await createUser();

    const result = await createPrayerRequest({
      request: "Initial prayer request",
      userId: user.id,
      notify: false,
      sharedWith: [{ type: "public", id: "1" }],
      status: PrayerRequestStatus.IN_PROGRESS,
    });

    if (!result.success || !result.prayerRequest) {
      throw new Error("Failed to create initial prayer request");
    }

    prayerRequest = result.prayerRequest;
  });

  test("successfully updates status of valid prayer request", async () => {
    const result = await updatePrayerRequestStatus({
      prayerRequestId: prayerRequest.id,
      newStatus: PrayerRequestStatus.ANSWERED,
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Prayer request status updated successfully.");

    const updated = await db.prayerRequest.findUnique({
      where: { id: prayerRequest.id },
    });

    expect(updated?.status).toBe(PrayerRequestStatus.ANSWERED);
  });

  test("returns error if ID format is invalid", async () => {
    const result = await updatePrayerRequestStatus({
      prayerRequestId: invalid_id,
      newStatus: PrayerRequestStatus.ANSWERED,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid ID format");
  });

  test("returns error if prayer request does not exist", async () => {
    const result = await updatePrayerRequestStatus({
      prayerRequestId: valid_id,
      newStatus: PrayerRequestStatus.IN_PROGRESS,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Prayer Request not found");
  });

  test("handles database errors gracefully", async () => {
    jest
      .spyOn(db.prayerRequest, "update")
      .mockRejectedValueOnce(new Error("DB failure"));

    const result = await updatePrayerRequestStatus({
      prayerRequestId: prayerRequest.id,
      newStatus: PrayerRequestStatus.IN_PROGRESS,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Failed to update prayer request status.");
  });
});

describe("getUserPrayerRequestsVisibleUser", () => {
  let user: User;
  let guest: User;
  let group: PrayerGroup;

  beforeEach(async () => {
    user = await createUser();
    guest = await createUser2();
    group = await createPrayerGroup(user.id);

    // Add both users to the same group with "ACCEPTED" status
    await db.userPrayerGroup.createMany({
      data: [
        { userId: user.id, prayerGroupId: group.id, groupStatus: "ACCEPTED" },
        { userId: guest.id, prayerGroupId: group.id, groupStatus: "ACCEPTED" },
      ],
    });
  });

  test("returns public and group-shared requests visible to guest", async () => {
    await createPrayerRequest({
      request: "Public Request",
      userId: user.id,
      notify: false,
      sharedWith: [{ type: "private", id: "2" }],
      status: PrayerRequestStatus.IN_PROGRESS,
    });

    await createPrayerRequest({
      request: "Public Request",
      userId: user.id,
      notify: false,
      sharedWith: [{ type: "public", id: "1" }],
      status: PrayerRequestStatus.IN_PROGRESS,
    });

    const groupResult = await createPrayerRequest({
      request: "Group Request",
      userId: user.id,
      notify: false,
      sharedWith: [{ type: "group", id: group.id }],
      status: PrayerRequestStatus.IN_PROGRESS,
    });

    if (groupResult.success && groupResult.prayerRequest) {
      await sharePrayerRequestWithGroup(
        groupResult.prayerRequest.id,
        group.id,
        user.id
      );
    }

    const result = await getUserPrayerRequestsVisibleUser({
      userId: user.id,
      guestUserId: guest.id,
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe(
      "Successfully fetched prayer requests for this user"
    );
    expect(result.prayerRequests).toHaveLength(2);
    const requestTexts = result.prayerRequests.map((r) => r.request);
    expect(requestTexts).toContain("Public Request");
    expect(requestTexts).toContain("Group Request");
  });

  test("returns only in progress requests", async () => {
    await createPrayerRequest({
      request: "Initial prayer request",
      userId: user.id,
      notify: false,
      sharedWith: [{ type: "public", id: "1" }],
      status: PrayerRequestStatus.IN_PROGRESS,
    });

    await createPrayerRequest({
      request: "Public Request",
      userId: user.id,
      notify: false,
      sharedWith: [{ type: "public", id: "1" }],
      status: PrayerRequestStatus.ANSWERED,
    });

    await createPrayerRequest({
      request: "Public Request",
      userId: user.id,
      notify: false,
      sharedWith: [{ type: "public", id: "1" }],
      status: PrayerRequestStatus.ARCHIVED,
    });

    const result = await getUserPrayerRequestsVisibleUser({
      userId: user.id,
      guestUserId: guest.id,
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe(
      "Successfully fetched prayer requests for this user"
    );
    expect(result.prayerRequests).toHaveLength(1);
    const requestTexts = result.prayerRequests.map((r) => r.request);
    expect(requestTexts).toContain("Initial prayer request");
    expect(requestTexts).not.toContain("Public Reques");
  });

  test("returns empty list if no visible requests", async () => {
    const result = await getUserPrayerRequestsVisibleUser({
      userId: user.id,
      guestUserId: guest.id,
    });
    expect(result.success).toBe(true);
    expect(result.prayerRequests).toEqual([]);
  });

  test("handles database error gracefully", async () => {
    jest
      .spyOn(db.prayerRequest, "findMany")
      .mockRejectedValueOnce(new Error("DB error"));

    const result = await getUserPrayerRequestsVisibleUser({
      userId: user.id,
      guestUserId: guest.id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Error fetching prayer requests for the user");
    expect(result.prayerRequests).toEqual([]);
  });
});
