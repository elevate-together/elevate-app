import { subscribeDevice } from "@/services/device";
import db from "@/lib/db";
import { ObjectId } from "mongodb";

beforeAll(async () => {
  await db.$connect();
});

beforeEach(async () => {
  await db.device.deleteMany();
  await db.user.deleteMany();
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await db.$disconnect();
});

const userData = {
  name: "Test User",
  email: "testuser@example.com",
};

async function createTestUser(data = userData) {
  return db.user.create({ data });
}

const validUserId = new ObjectId().toString();
const invalidUserId = "invalid_user_id";
const validSub = {
  endpoint: "https://example.com/endpoint",
  keys: {
    p256dh: "valid_p256dh_key",
    auth: "valid_auth_key",
  },
};

describe("subscribeDevice", () => {
  test("successfully subscribes a device", async () => {
    const user = await createTestUser();
    const result = await subscribeDevice({
      sub: validSub,
      userId: user.id,
      name: "My Device",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Device subscribed successfully");

    const device = await db.device.findUnique({
      where: {
        userId_endpoint: { userId: validUserId, endpoint: validSub.endpoint },
      },
    });

    expect(device).not.toBeNull();
    expect(device?.userId).toBe(validUserId);
    expect(device?.endpoint).toBe(validSub.endpoint);
    expect(device?.title).toBe("My Device");
  });

  test("successfully subscribes a device with default device name when name is not provided", async () => {
    const result = await subscribeDevice({
      sub: validSub,
      userId: validUserId,
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Device subscribed successfully");

    const device = await db.device.findUnique({
      where: {
        userId_endpoint: { userId: validUserId, endpoint: validSub.endpoint },
      },
    });

    expect(device).not.toBeNull();
    expect(device?.userId).toBe(validUserId);
    expect(device?.endpoint).toBe(validSub.endpoint);
    expect(device?.title).toMatch(/Device Added:/);
  });

  test("returns error when userId is invalid", async () => {
    const result = await subscribeDevice({
      sub: validSub,
      userId: invalidUserId,
      name: "Invalid ID format",
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid ID format");
  });

  test("returns error when subscription object is invalid", async () => {
    const result = await subscribeDevice({
      sub: { endpoint: "", keys: { p256dh: "", auth: "" } },
      userId: validUserId,
      name: "My Device",
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Failed to subscribe device");
  });

  test("successfully updates device if already subscribed", async () => {
    const initialResult = await subscribeDevice({
      sub: validSub,
      userId: validUserId,
      name: "Old Device",
    });

    expect(initialResult.success).toBe(true);
    expect(initialResult.message).toBe("Device subscribed successfully");

    const updatedResult = await subscribeDevice({
      sub: validSub,
      userId: validUserId,
      name: "Updated Device",
    });

    expect(updatedResult.success).toBe(true);
    expect(updatedResult.message).toBe("Device subscribed successfully");

    const device = await db.device.findUnique({
      where: {
        userId_endpoint: { userId: validUserId, endpoint: validSub.endpoint },
      },
    });

    expect(device).not.toBeNull();
    expect(device?.title).toBe("Updated Device");
  });

  test("returns error if device subscription fails in the database", async () => {
    jest
      .spyOn(db.device, "upsert")
      .mockRejectedValueOnce(new Error("DB error"));

    const result = await subscribeDevice({
      sub: validSub,
      userId: validUserId,
      name: "My Device",
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Failed to subscribe device");
  });
});
