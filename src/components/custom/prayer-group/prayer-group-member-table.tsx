"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import UserAvatar from "@/components/custom/user/user-avatar";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EllipsisVertical,
  HelpingHandIcon,
  Loader,
  User as UserIco,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { removeUserFromPrayerGroup } from "@/services/user-prayer-group";
import { MinimalUser } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type PrayerGroupMemberTableProps = {
  data: MinimalUser[];
  groupId: string;
  ownerId: string;
  isOwner?: boolean;
};
export default function PrayerGroupMemberTable({
  data,
  isOwner = false,
  ownerId,
  groupId,
}: PrayerGroupMemberTableProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRemoveUser = async (userId: string) => {
    setLoading(true);
    const result = await removeUserFromPrayerGroup(userId, groupId, ownerId);
    if (result.success) {
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  function MemberActionMenu({ userId }: { userId: string }) {
    const router = useRouter();

    return (
      <div className="flex justify-end w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/requests/${userId}`)}
            >
              <HelpingHandIcon className="h-4 w-4" />
              Prayer Requests
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/user/${userId}`)}>
              <UserIco className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            {isOwner && userId !== ownerId && (
              <DropdownMenuItem
                disabled={loading}
                onClick={() => handleRemoveUser(userId)}
                className="text-red-500 focus:text-red-600"
              >
                {loading ? <Loader className="spinner animate-spin" /> : <X />}
                Remove
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  const columns: ColumnDef<MinimalUser>[] = [
    {
      accessorKey: "name",
      enableHiding: false,
      header: "User",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2 items-center">
            <UserAvatar user={row.original} size="small" />
            {row.original.id === ownerId && (
              <Badge variant="outline">Owner</Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      enableHiding: false,
      header: () => <div className="lg:block hidden">Joined</div>,
      cell: ({ row }) => {
        return (
          <div className="capitalize lg:block hidden">
            <div className="font-medium invisible md:visible">
              {format(new Date(row.getValue("createdAt")), "MMMM d, yyyy")}
            </div>
          </div>
        );
      },
    },
    {
      id: "join",
      enableHiding: false,
      cell: ({ row }) => <MemberActionMenu userId={row.original.id} />,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-4 w-full mt-5">
      <div>
        <div className="text-base font-bold mb-1">All Members</div>
        <div className="text-muted-foreground text-sm">
          As a member of this group, you can view all group prayer requests.
          Please keep shared information private and within the group.
        </div>
      </div>
      <div className="flex items-center">
        <Input
          placeholder="Find Member..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm bg-card"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-top justify-between ">
        <div className="text-xs text-center text-muted-foreground pl-2">{`Member Count: ${data.length}`}</div>
        <div className="flex flex-row items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
