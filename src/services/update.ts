"use server";

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export async function updateEmptyTimezones(): Promise<{
  success: boolean;
  message: string;
  updatedCount: number;
}> {
  try {
    const result = await db.user.updateMany({
      where: {
        OR: [{ timeZone: undefined }],
      },
      data: {
        timeZone: "CHICAGO",
      },
    });

    return {
      success: true,
      message: `${result.count} user(s) updated`,
      updatedCount: result.count,
    };
  } catch (error) {
    console.error("Error updating timezones:", error);
    return {
      success: false,
      message: "Failed to update users",
      updatedCount: 0,
    };
  }
}
