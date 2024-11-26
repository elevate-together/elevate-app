import { PrismaClient } from "@prisma/client";
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

import TestNotifyButton from "@components/custom/TestNotifyButton";

const prisma = new PrismaClient();

async function getAllDevices() {
  const users = await prisma.user.findMany({
    include: {
      devices: true,
    },
  });

  return {
    users,
  };
}

const getOSVersion = (osVersion: string) => {
  // iOS version extraction
  const iosMatch = osVersion.match(/iPhone OS (\d+_\d+_\d+)/);
  if (iosMatch) {
    return `iOS ${iosMatch[1].replace(/_/g, ".")}`;
  }

  // Android version extraction
  const androidMatch = osVersion.match(/Android (\d+\.\d+\.\d+)/);
  if (androidMatch) {
    return `Android ${androidMatch[1]}`;
  }

  // macOS version extraction for MacIntel
  const macMatch = osVersion.match(/Macintosh.*Mac OS X (\d+_\d+_\d+)/);
  if (macMatch) {
    return `macOS ${macMatch[1].replace(/_/g, ".")}`;
  }

  // Other platform version extraction (e.g., web browsers)
  const otherMatch = osVersion.match(/Version\/(\d+\.\d+\.\d+)/);
  if (otherMatch) {
    return `Other Platform Version ${otherMatch[1]}`;
  }

  // Fallback if no match is found
  return "Not available";
};

const UsersPage = async () => {
  const { users } = await getAllDevices();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users and Devices</h1>
      {users.length > 0 ? (
        <Table>
          <TableCaption>All Registered Devices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">User</TableHead>
              <TableHead>Device</TableHead>
              <TableHead className="w-[50px]"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <>
                    <div className="font-bold">{user.name}</div>
                    <div>{user.email}</div>
                  </>
                </TableCell>
                <TableCell className="font-medium">
                  <div key={user.id}>
                    {user.devices && user.devices.length > 0 ? (
                      user.devices.map((device) => (
                        <div key={device.id}>
                          <p>
                            <strong>Platform:</strong> {device.platform}
                          </p>
                          <p>
                            <strong>OS Version:</strong>{" "}
                            {getOSVersion(device.osVersion)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div>No devices</div>
                    )}
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
                        <TestNotifyButton
                          userId={user.id}
                          message="Test push"
                        />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
};

export default UsersPage;
