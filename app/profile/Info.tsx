import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { getOSVersion } from "@utils/getOsVersion";
import TestNotifyButton from "@components/custom/TestNotifyButton";
import { auth } from "@auth";
import { redirect } from "next/navigation";
import PushNotificationManager from "@components/custom/PushNotificationManager";
import db from "@lib/db";
import { toZonedTime } from "date-fns-tz";

async function getUserDevices(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        devices: true,
      },
    });

    if (user) {
      return {
        devices: user.devices,
      };
    } else {
      return { devices: [] };
    }
  } catch (error) {
    console.error("Error fetching devices:", error);
    throw new Error("Failed to fetch devices");
  }
}

export const Info = async () => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const { devices } = await getUserDevices(userId);

  const timeZone = "America/Chicago";

  const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
    timeZone: timeZone,
    timeZoneName: "short",
  });

  return (
    <div className="container mx-auto p-4 w-full">
      <h1 className="text-2xl font-bold mb-4">
        Make changes to your account here.
      </h1>
    </div>
  );
};
