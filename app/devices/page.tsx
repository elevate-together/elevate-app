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
import db from "@lib/db";

async function getAllDevices() {
  const users = await db.user.findMany({
    include: {
      devices: true,
    },
  });

  return {
    users,
  };
}

const UsersPage = async () => {
  const { users } = await getAllDevices();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users and Devices</h1>
      {users.length > 0 ? (
        <Table className="table-fixed">
          <TableCaption>All Registered Devices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[130px] md:w-[250px]">User</TableHead>
              <TableHead>Device</TableHead>
              <TableHead className="w-[50px]"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="break-words">
                <TableCell className="font-medium">
                  <div>
                    <div className="font-bold">{user.name}</div>
                    <div>{user.email}</div>
                  </div>
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
