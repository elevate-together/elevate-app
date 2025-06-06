import prisma from "@/lib/prisma";
import {
  createPrayerGroup,
  deletePrayerGroup,
  getPrayerGroupById,
  getPrayerGroupWithCountById,
  updatePrayerGroup,
  updatePrayerGroupOwner,
} from "@/services/prayer-group";
import { GroupStatus, GroupType } from "@prisma/client";
import {
  createUser,
  createPrayerGroup as createPrayerGroupInDb,
  clearDatabase,
  valid_id,
  invalid_id,
  linkUserToGroup,
} from "@/services/test/test.utils";

beforeAll(() => db.$connect());
beforeEach(() => clearDatabase());
afterEach(() => jest.restoreAllMocks());
afterAll(() => db.$disconnect());

/* getPrayerGroupById */

describe("getPrayerGroupById", () => {
  test("returns prayer group successfully by ID", async () => {
    const user = await createUser();
    const group = await createPrayerGroupInDb(user.id);

    const result = await getPrayerGroupById({ id: group.id });

    expect(result.success).toBe(true);
    expect(result.prayerGroup?.name).toBe("Test Group");
    expect(result.prayerGroup?.owner?.email).toBe("user@example.com");
  });

  test("returns not found when prayer group does not exist", async () => {
    const result = await getPrayerGroupById({ id: valid_id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Prayer group not found");
  });

  test("returns error for invalid ID format", async () => {
    const result = await getPrayerGroupById({ id: invalid_id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid ID format");
  });

  test("handles unexpected error", async () => {
    jest.spyOn(db.prayerGroup, "findUnique").mockImplementationOnce(() => {
      throw new Error("Simulated DB error");
    });

    const result = await getPrayerGroupById({ id: valid_id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Error fetching prayer group by ID");
  });
});

/* getPrayerGroupWithCountById */

describe("getPrayerGroupWithCountById", () => {
  test("returns prayer group with user count", async () => {
    const user = await createUser();
    const group = await createPrayerGroupInDb(user.id);
    await linkUserToGroup({ userId: user.id, prayerGroupId: group.id });

    const result = await getPrayerGroupWithCountById(group.id);

    expect(result.success).toBe(true);
    expect(result.prayerGroup?._count?.users).toBe(1);
  });

  test("returns not found when prayer group does not exist", async () => {
    const result = await getPrayerGroupWithCountById(valid_id);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Prayer group not found");
  });

  test("returns error for invalid ID format", async () => {
    const result = await getPrayerGroupWithCountById(invalid_id);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid ID format");
  });

  test("handles unexpected error", async () => {
    jest.spyOn(db.prayerGroup, "findUnique").mockImplementationOnce(() => {
      throw new Error("Simulated DB error");
    });

    const result = await getPrayerGroupWithCountById(valid_id);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Error fetching prayer group by ID");
  });
});

/* createPrayerGroup */

describe("createPrayerGroup", () => {
  test("successfully creates a new prayer group", async () => {
    const user = await createUser();

    const result = await createPrayerGroup({
      name: "New Test Group",
      ownerId: user.id,
      groupType: GroupType.PUBLIC,
      description: "A group for testing",
    });

    expect(result.success).toBe(true);
    expect(result.prayerGroup?.name).toBe("New Test Group");

    const membership = await prisma.userPrayerGroup.findFirst({
      where: {
        userId: user.id,
        prayerGroupId: result.prayerGroup?.id,
      },
    });

    expect(membership).toBeDefined();
    expect(membership?.groupStatus).toBe(GroupStatus.ACCEPTED);
  });

  test("handles unexpected error", async () => {
    jest.spyOn(db.prayerGroup, "create").mockImplementationOnce(() => {
      throw new Error("Simulated DB error");
    });

    const user = await createUser();

    const result = await createPrayerGroup({
      name: "Fail Group",
      ownerId: user.id,
      groupType: GroupType.PUBLIC,
      description: "Should fail",
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Error creating prayer group, try again.");
  });
});

/* updatePrayerGroup */

describe("updatePrayerGroup", () => {
  test("updates name and description", async () => {
    const user = await createUser();
    const group = await createPrayerGroupInDb(user.id, {
      name: "Old Name",
      description: "Old Desc",
    });

    const result = await updatePrayerGroup({
      id: group.id,
      groupData: { name: "New Name", description: "New Desc" },
    });

    expect(result.success).toBe(true);
    expect(result.prayerGroup?.name).toBe("New Name");
  });

  test("fails with invalid ID", async () => {
    const result = await updatePrayerGroup({
      id: invalid_id,
      groupData: { name: "Fail" },
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid ID format");
  });

  test("fails if group not found", async () => {
    const result = await updatePrayerGroup({
      id: valid_id,
      groupData: { name: "Fail" },
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Prayer group not found");
  });

  test("handles unexpected error", async () => {
    jest.spyOn(db.prayerGroup, "findUnique").mockImplementationOnce(() => {
      throw new Error("Simulated DB error");
    });

    const result = await updatePrayerGroup({
      id: valid_id,
      groupData: { name: "Error" },
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Error updating prayer group");
  });
});

/* deletePrayerGroup */

describe("deletePrayerGroup", () => {
  test("deletes existing group", async () => {
    const user = await createUser();
    const group = await createPrayerGroupInDb(user.id);

    const result = await deletePrayerGroup({ id: group.id });

    expect(result.success).toBe(true);
    const check = await prisma.prayerGroup.findUnique({
      where: { id: group.id },
    });
    expect(check).toBeNull();
  });

  test("returns error for invalid ID", async () => {
    const result = await deletePrayerGroup({ id: invalid_id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid ID format");
  });

  test("returns error if group not found", async () => {
    const result = await deletePrayerGroup({ id: valid_id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Prayer group not found");
  });

  test("handles unexpected error", async () => {
    jest.spyOn(db.prayerGroup, "findUnique").mockImplementationOnce(() => {
      throw new Error("Simulated DB error");
    });

    const result = await deletePrayerGroup({ id: valid_id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Error deleting prayer group");
  });
});

/* updatePrayerGroupOwner */

describe("updatePrayerGroupOwner", () => {
  test("successfully updates owner and creates membership", async () => {
    const originalOwner = await createUser();
    const newOwner = await createUser({
      name: "New Owner",
      email: "new@example.com",
    });

    const group = await createPrayerGroupInDb(originalOwner.id);

    const result = await updatePrayerGroupOwner({
      prayerGroupId: group.id,
      newOwnerId: newOwner.id,
    });

    expect(result.success).toBe(true);
    expect(result.prayerGroup?.owner.id).toBe(newOwner.id);

    const membership = await prisma.userPrayerGroup.findFirst({
      where: {
        userId: newOwner.id,
        prayerGroupId: group.id,
      },
    });

    expect(membership).not.toBeNull();
    expect(membership?.groupStatus).toBe(GroupStatus.ACCEPTED);
  });

  test("fails with invalid ID", async () => {
    const user = await createUser();

    const result = await updatePrayerGroupOwner({
      prayerGroupId: invalid_id,
      newOwnerId: user.id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid ID format");
  });

  test("fails if group not found", async () => {
    const user = await createUser();

    const result = await updatePrayerGroupOwner({
      prayerGroupId: valid_id,
      newOwnerId: user.id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Prayer group not found");
  });

  test("handles unexpected error", async () => {
    const user = await createUser();

    jest.spyOn(db.prayerGroup, "findUnique").mockImplementationOnce(() => {
      throw new Error("Simulated DB error");
    });

    const result = await updatePrayerGroupOwner({
      prayerGroupId: valid_id,
      newOwnerId: user.id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Failed to update prayer group owner.");
  });
});
