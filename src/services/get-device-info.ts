"use server";

import { headers } from "next/headers";
import { userAgent } from "next/server";
export async function getDeviceInfo() {
  const headersList = await headers();
  const userAgentData = userAgent({ headers: headersList });
  console.log(userAgentData);
  return {
    vendor: userAgentData.device.vendor,
    os: userAgentData.os.name,
  };
}
