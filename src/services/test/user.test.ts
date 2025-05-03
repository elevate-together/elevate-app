// services/user.service.test.ts

import db from "@/lib/db";
import { getAllUsers } from "@/services/user";

beforeAll(async () => {
  await db.$connect();
});

beforeEach(async () => {
  await db.user.deleteMany();
});

afterAll(async () => {
  await db.$disconnect();
});

test("returns all users successfully", async () => {
  await db.user.createMany({
    data: [
      { email: "user1@example.com", name: "User One" },
      { email: "user2@example.com", name: "User Two" },
    ],
  });

  const result = await getAllUsers();

  expect(result.success).toBe(true);
  expect(result.users).toHaveLength(2);
  expect(result.users?.[0].email).toBe("user1@example.com");
});
