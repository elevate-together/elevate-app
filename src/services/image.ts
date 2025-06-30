"use server";

import { put, del } from "@vercel/blob";

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error("Missing BLOB_READ_WRITE_TOKEN environment variable");
}

export async function uploadGroupImage(
  groupId: string,
  file: File
): Promise<{
  success: boolean;
  message: string;
  url?: string;
}> {
  try {
    const extension = file.name.split(".").pop() ?? "png";
    const filename = `groups/${groupId}.${extension}`;

    const blob = await put(filename, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return {
      success: true,
      message: "Upload successful",
      url: blob.url,
    };
  } catch {
    return {
      success: false,
      message: "Upload failed",
    };
  }
}

export async function deleteGroupImage(imageUrl: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const url = new URL(imageUrl);
    const pathname = url.pathname.startsWith("/")
      ? url.pathname.slice(1)
      : url.pathname;

    await del(pathname, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return {
      success: true,
      message: "Image deleted successfully",
    };
  } catch {
    return {
      success: false,
      message: "Failed to delete image",
    };
  }
}
