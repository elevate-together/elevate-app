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

async function getAllDevices(userId: string) {
  try {
    const users = await db.user.findMany({
      where: {
        id: userId,
      },
      include: {
        devices: true,
      },
    });
    return users.length > 0 ? users[0].devices : [];
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

  const devices = await getAllDevices(userId);

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
          {devices.length > 0 ? (
            devices.map((device) => (
              <TableRow key={device.id} className="break-words">
                <TableCell className="font-medium">
                  <div>
                    <p>
                      <strong>Platform:</strong> {device.platform}
                    </p>
                    <p>
                      <strong>OS Version:</strong>{" "}
                      {getOSVersion(device.osVersion)}
                    </p>
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
                You don`&apos;`t have any devices linked to your account
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
