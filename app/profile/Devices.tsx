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
import { format } from "date-fns";

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
        username: user.name,
        devices: user.devices,
      };
    } else {
      return { username: null, devices: [] };
    }
  } catch (error) {
    console.error("Error fetching devices:", error);
    throw new Error("Failed to fetch devices");
  }
}

export const Devices = async () => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const { username, devices } = await getUserDevices(userId);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Devices</h1>
      <PushNotificationManager userId={userId} />

      <Table className="table-fixed">
        <TableCaption>Your Registered Devices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Device</TableHead>
            <TableHead className="w-[50px]"> </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices && devices.length > 0 ? (
            devices.map((device) => (
              <TableRow key={device.id} className="break-words">
                <TableCell className="font-medium">
                  <div>
                    <p className="text-lg font-bold">
                      {username ? `${username.split(" ")[0]}'s` : "User's"}{" "}
                      {device.platform}
                    </p>
                    <div className="text-gray-500 text-s">
                      <p>OS: {getOSVersion(device.osVersion)}</p>
                      <p>
                        Date Added:{" "}
                        {format(
                          new Date(device.createdAt),
                          "MM/dd/yyyy h:mm a",
                        )}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <EllipsisVertical />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="p-0">
                        <TestNotifyButton userId={userId} message="Test push" />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="break-words">
              <TableCell colSpan={3} className="font-medium text-center">
                You don&apos;t have any devices linked to your account
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
