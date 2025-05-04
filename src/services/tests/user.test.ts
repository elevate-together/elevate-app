import db from "@/lib/db";
import {
  createUser,
  deleteUser,
  getUserById,
  updateUser,
} from "@/services/user";
import { ObjectId } from "mongodb";

beforeAll(async () => {
  await db.$connect();
});

beforeEach(async () => {
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
  email: "user@example.com",
};

/* getUserById */

test("getUserById - returns user successfully by ID", async () => {
  const createdUser = await db.user.create({
    data: userData,
  });

  const result = await getUserById({ id: createdUser.id });

  expect(result.success).toBe(true);
  expect(result.user).toBeDefined();
  expect(result.user?.email).toBe("user@example.com");
  expect(result.user?.name).toBe("Test User");
});

test("getUserById - returns not found when user does not exist", async () => {
  const result = await getUserById({ id: valid_id });

  expect(result.success).toBe(false);
  expect(result.message).toBe("User not found");
  expect(result.user).toBeNull();
});

test("getUserById - returns error when given an invalid user ID format", async () => {
  const result = await getUserById({ id: invalid_id });

  expect(result.success).toBe(false);
  expect(result.message).toBe("Invalid ID format");
  expect(result.user).toBeNull();
});

test("getUserById - returns error when user fetch fails", async () => {
  jest
    .spyOn(db.user, "findUnique")
    .mockRejectedValueOnce(new Error("DB error"));

  const createdUser = await db.user.create({
    data: userData,
  });

  const result = await getUserById({ id: createdUser.id });

  expect(result.success).toBe(false);
  expect(result.message).toBe("Error fetching user by ID");
  expect(result.user).toBeNull();
});

/* createUser */

test("createUser - successfully creates user", async () => {
  const result = await createUser(userData);

  expect(result.success).toBe(true);
  expect(result.user).toBeDefined();
  expect(result.user?.email).toBe("user@example.com");
  expect(result.user?.name).toBe("Test User");
});

test("createUser - returns error when user creation fails", async () => {
  jest.spyOn(db.user, "create").mockRejectedValueOnce(new Error("DB error"));

  const result = await createUser(userData);

  expect(result.success).toBe(false);
  expect(result.message).toBe("Error creating user, try again.");
  expect(result.user).toBeNull();
});

/* updateUser */

test("updateUser - successfully updates user when given a valid user ID and data", async () => {
  const user = await db.user.create({
    data: userData,
  });

  expect(user.name).toBe("Test User");
  expect(user.email).toBe("user@example.com");

  const updatedData = { name: "New Name" };
  const result = await updateUser({ id: user.id, userData: updatedData });

  expect(result.success).toBe(true);
  expect(result.message).toBe("User updated successfully");
  expect(result.user).toBeDefined();
  expect(result.user?.name).toBe("New Name");
  expect(result.user?.email).toBe("user@example.com");
});

test("updateUser - returns error when given an invalid user ID format", async () => {
  const result = await updateUser({
    id: invalid_id,
    userData: { name: "New Name" },
  });
  expect(result.success).toBe(false);
  expect(result.message).toBe("Invalid ID format");
  expect(result.user).toBeNull();
});

test("updateUser - returns error when user does not exist", async () => {
  const result = await updateUser({
    id: valid_id,
    userData: {
      name: "New Name",
    },
  });
  expect(result.success).toBe(false);
  expect(result.message).toBe("User not found");
  expect(result.user).toBeNull();
});

test("updateUser - returns error when user update fails", async () => {
  jest.spyOn(db.user, "update").mockRejectedValueOnce(new Error("DB error"));
  const user = await db.user.create({
    data: userData,
  });

  const result = await updateUser({
    id: user.id,
    userData: {
      name: "New Name",
    },
  });
  expect(result.success).toBe(false);
  expect(result.message).toBe("Error updating user, try again.");
  expect(result.user).toBeNull();
});

/* deleteUser */

test("deleteUser - successfully deletes user when user exists", async () => {
  const createdUser = await db.user.create({
    data: userData,
  });

  expect(createdUser).toBeDefined();
  expect(createdUser.name).toBe("Test User");

  const result = await deleteUser({ id: createdUser.id });

  expect(result.success).toBe(true);
  expect(result.message).toBe("User deleted successfully");

  const deletedUser = await db.user.findUnique({
    where: { id: createdUser.id },
  });

  expect(deletedUser).toBeNull();
});

test("deleteUser - returns error when user does not exist", async () => {
  const result = await deleteUser({ id: valid_id });

  expect(result.success).toBe(false);
  expect(result.message).toBe("User not found");
});

test("deleteUser - returns error when given an invalid user ID format", async () => {
  const result = await deleteUser({ id: invalid_id });

  expect(result.success).toBe(false);
  expect(result.message).toBe("Invalid ID format");
});

test("deleteUser - returns error when user delete fails", async () => {
  jest.spyOn(db.user, "delete").mockRejectedValueOnce(new Error("DB error"));
  const user = await db.user.create({
    data: userData,
  });

  const result = await deleteUser({ id: user.id });

  expect(result.success).toBe(false);
  expect(result.message).toBe("Error deleting user, try again.");
});
