import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function getStaticProps() {
  const users = await prisma.user.findMany({
    include: {
      devices: true,
    },
  });

  return {
    users,
  };
}

const UsersPage = async () => {
  const { users } = await getStaticProps();
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users and Devices</h1>
      {users.length > 0 ? (
        users.map((user) => (
          <div key={user.id} className="border-b pb-4 mb-4">
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p>Email: {user.email}</p>
            <h3 className="mt-2 font-semibold">Devices:</h3>
            <ul className="list-disc ml-5">
              {user.devices.map((device) => (
                <li key={device.id}>
                  <p>
                    <strong>Platform:</strong> {device.platform}
                  </p>
                  <p>
                    <strong>OS Version:</strong> {device.osVersion}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
};

export default UsersPage;
