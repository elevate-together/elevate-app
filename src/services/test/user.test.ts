import db from "@/lib/db";
import {
  createUser,
  deleteUser,
  getUserById,
  updateUser,
} from "@/services/user";
import { ObjectId } from "mongodb";

const invalid_id = "invalid_id";
const valid_id = new ObjectId().toString();

const userData = {
  name: "Test User",
  email: "user@example.com",
};

const createTestUser = (overrides = {}) =>
  db.user.create({
    data: {
      ...userData,
      ...overrides,
    },
  });

beforeAll(() => db.$connect());
beforeEach(() => db.user.deleteMany());
afterEach(() => jest.restoreAllMocks());
afterAll(() => db.$disconnect());

/* getUserById */

describe("getUserById", () => {
  test("returns user successfully by ID", async () => {
    const createdUser = await createTestUser();

    const result = await getUserById({ id: createdUser.id });

    expect(result.success).toBe(true);
    expect(result.user?.email).toBe("user@example.com");
    expect(result.user?.name).toBe("Test User");
  });

  test("returns not found when user does not exist", async () => {
    const result = await getUserById({ id: valid_id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("User not found");
    expect(result.user).toBeNull();
  });

  test("returns error for invalid ID format", async () => {
    const result = await getUserById({ id: invalid_id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid ID format");
    expect(result.user).toBeNull();
  });

  test("handles error during fetch", async () => {
    jest
      .spyOn(db.user, "findUnique")
      .mockRejectedValueOnce(new Error("DB error"));
    const createdUser = await createTestUser();

    const result = await getUserById({ id: createdUser.id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Error fetching user by ID");
    expect(result.user).toBeNull();
  });
});

/* createUser Tests */

describe("createUser", () => {
  test("successfully creates user", async () => {
    const result = await createUser(userData);

    expect(result.success).toBe(true);
    expect(result.user?.email).toBe("user@example.com");
    expect(result.user?.name).toBe("Test User");
  });

  test("returns error when creation fails", async () => {
    jest.spyOn(db.user, "create").mockRejectedValueOnce(new Error("DB error"));

    const result = await createUser(userData);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Error creating user, try again.");
    expect(result.user).toBeNull();
  });
});

/* updateUser Tests */

describe("updateUser", () => {
  test("updates user with valid ID and data", async () => {
    const user = await createTestUser();

    const result = await updateUser({
      id: user.id,
      userData: { name: "New Name" },
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("User updated successfully");
    expect(result.user?.name).toBe("New Name");
    expect(result.user?.email).toBe("user@example.com");
  });

  test("returns error for invalid ID format", async () => {
    const result = await updateUser({
      id: invalid_id,
      userData: { name: "New" },
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid ID format");
    expect(result.user).toBeNull();
  });

  test("returns error when user not found", async () => {
    const result = await updateUser({
      id: valid_id,
      userData: { name: "Missing" },
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("User not found");
    expect(result.user).toBeNull();
  });

  test("handles error during update", async () => {
    jest.spyOn(db.user, "update").mockRejectedValueOnce(new Error("DB error"));
    const user = await createTestUser();

    const result = await updateUser({ id: user.id, userData: { name: "Err" } });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Error updating user, try again.");
    expect(result.user).toBeNull();
  });
});

/* deleteUser */

describe("deleteUser", () => {
  test("successfully deletes existing user", async () => {
    const user = await createTestUser();

    const result = await deleteUser({ id: user.id });

    expect(result.success).toBe(true);
    expect(result.message).toBe("User deleted successfully");

    const deleted = await db.user.findUnique({ where: { id: user.id } });
    expect(deleted).toBeNull();
  });

  test("returns error when user does not exist", async () => {
    const result = await deleteUser({ id: valid_id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("User not found");
  });

  test("returns error for invalid ID format", async () => {
    const result = await deleteUser({ id: invalid_id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid ID format");
  });

  test("handles error during delete", async () => {
    jest.spyOn(db.user, "delete").mockRejectedValueOnce(new Error("DB error"));
    const user = await createTestUser();

    const result = await deleteUser({ id: user.id });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Error deleting user, try again.");
  });
});
