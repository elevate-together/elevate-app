"use server";

import { del } from "@vercel/blob";

export async function deleteImage(imageUrl: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const url = new URL(imageUrl);
    const pathname = url.pathname.slice(1);

    console.log("DELETING ", pathname);
    await del(pathname, {
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });

    return {
      success: true,
      message: "Image deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting blob:", error);
    return {
      success: false,
      message: "Failed to delete image",
    };
  }
}
