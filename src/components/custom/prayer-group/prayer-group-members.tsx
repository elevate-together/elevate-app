import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUsersByPrayerGroup } from "@/services/user-prayer-group";
import { User } from "@prisma/client";
import { format } from "date-fns";
import UserView from "../functions/user-view";
import UserAvatar from "../user/user-avatar";

type UserInfo = Pick<User, "id" | "name" | "email" | "image" | "createdAt">;

export default async function PrayerGroupMembers({ id }: { id: string }) {
  const members = await getUsersByPrayerGroup(id);

  console.log(members);

  return (
    <div>
      {members && members.users ? (
        <Table>
          <TableCaption className="text-xs">{`Member Count: ${members.users.length}`}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden md:block">Joined</TableHead>
              <TableHead hidden>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.users?.map((member: UserInfo) => (
              <TableRow key={member.id} className="hover:bg-transparent">
                <TableCell className="font-medium">
                  <UserAvatar
                    name={member.name}
                    image={member.image ?? undefined}
                    email={member.email}
                    size="small"
                    includeEmail={false}
                  />
                </TableCell>
                <TableCell className="font-medium hidden md:block">
                  <div>
                    {format(new Date(member.createdAt), "MMMM d, yyyy")}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-right">
                  <UserView id={member.id} variant="ghost" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div>No Members found in this group</div>
      )}
    </div>
  );
}
