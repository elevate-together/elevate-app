import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <>
                    <div className="font-bold">{user.name}</div>
                    <div> {user.email}</div>
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
                      <div>No devices</div> // Corrected the closing div tag
                    )}
                  </div>
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
