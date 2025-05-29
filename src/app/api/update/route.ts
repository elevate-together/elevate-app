import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const result = await db.user.updateMany({
      where: {
        timeZone: undefined,
      },
      data: {
        timeZone: "CHICAGO",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Updated ${result.count} users`,
    });
  } catch (error) {
    console.error("Error updating users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update users." },
      { status: 500 }
    );
  }
}
