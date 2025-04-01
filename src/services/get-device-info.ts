"use server";

import { headers } from "next/headers";
import { userAgent } from "next/server";
export async function getDeviceInfo() {
  const headersList = await headers();
  const userAgentData = userAgent({ headers: headersList });
  return {
    vendor: userAgentData.device.vendor,
    os: userAgentData.os.name,
  };
}
