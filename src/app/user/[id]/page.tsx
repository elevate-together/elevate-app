import DeviceCard from "@/components/custom/device/device-card";
import PushNotificationManager from "@/components/custom/functions/push-notification-manager";
import UserAvatar from "@/components/custom/user/user-avatar";
import { getUserById, getUserDevices } from "@/services/users";

export default async function Profile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const { user } = await getUserById(id);

  const { devices } = await getUserDevices(id);

  if (!user) {
    return <div className="p-2">Unable to Find User</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <UserAvatar
        name={user.name}
        image={user.image ?? undefined}
        email={user.email}
        size="large"
      />
      <PushNotificationManager userId={user.id} />
      {devices && (
        <div>
          <div className="text-xl font-semibold mb-2">Your Devices</div>
          {devices.map((device) => (
            <DeviceCard key={device.id} userId={user.id} device={device} />
          ))}
        </div>
      )}
    </div>
  );
}
