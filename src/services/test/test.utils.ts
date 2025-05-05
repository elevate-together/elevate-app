import db from "@/lib/db";
import {
  GroupStatus,
  GroupType,
  PrayerRequestStatus,
  PrayerVisibility,
  ShareType,
  User,
} from "@prisma/client";
import { ObjectId } from "mongodb";

export const valid_id = new ObjectId().toString();
export const invalid_id = "invalid_id";

export const createUser = (overrides = {}) =>
  db.user.create({
    data: {
      name: "Test User",
      email: "user@example.com",
      ...overrides,
    },
  });

export const createUser2 = (overrides = {}) =>
  db.user.create({
    data: {
      name: "Test User",
      email: "user2@example.com",
      ...overrides,
    },
  });

export type ShareWithTypes = "public" | "private" | "group";

export type ShareWith = {
  type: ShareWithTypes;
  id: string;
};

type PrayerRequestDataOverrides = Partial<{
  request: string;
  notify: boolean;
  sharedWith: ShareWith[];
  userId: string;
  status: PrayerRequestStatus;
}>;

export const getPrayerRequestData = (
  user: User,
  shareWith: ShareWith[],
  overrides: PrayerRequestDataOverrides = {}
) => ({
  request: "Test prayer request",
  notify: true,
  sharedWith: shareWith,
  userId: user.id,
  status: PrayerRequestStatus.IN_PROGRESS,
  ...overrides,
});

export const createPrayerGroup = (ownerId: string, overrides = {}) =>
  db.prayerGroup.create({
    data: {
      name: "Test Group",
      ownerId,
      groupType: GroupType.PUBLIC,
      ...overrides,
    },
  });

export const clearDatabase = async () => {
  await db.userPrayerGroup.deleteMany();
  await db.prayerGroup.deleteMany();
  await db.prayerRequest.deleteMany();
  await db.prayerRequestShare.deleteMany();
  await db.notification.deleteMany();
  await db.device.deleteMany();
  await db.user.deleteMany();
};

export const linkUserToGroup = ({
  userId,
  prayerGroupId,
  groupStatus = GroupStatus.ACCEPTED,
}: {
  userId: string;
  prayerGroupId: string;
  groupStatus?: GroupStatus;
}) =>
  db.userPrayerGroup.create({
    data: {
      userId,
      prayerGroupId,
      groupStatus,
    },
  });

export async function createTestPrayerRequest(
  user: User,
  requestOverride = {}
) {
  return db.prayerRequest.create({
    data: {
      request: "Test request",
      status: PrayerRequestStatus.IN_PROGRESS,
      visibility: PrayerVisibility.PRIVATE,
      user: { connect: { id: user.id } },
      ...requestOverride,
    },
  });
}

export async function sharePrayerRequestWithGroup(
  prayerRequestId: string,
  groupId: string,
  ownerId: string
) {
  return db.prayerRequestShare.create({
    data: {
      prayerRequestId,
      sharedWithId: groupId,
      sharedWithType: ShareType.GROUP,
      ownerId,
    },
  });
}
