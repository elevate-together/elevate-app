"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PrayerGroupWithOwnerAndUsers } from "@/lib/utils";
import { GroupType, User } from "@prisma/client";
import UserAvatar from "../user/user-avatar";
import JoinGroup from "../user/user-join-group";
import PrayerGroupDialog from "./prayer-group-dialog";
import { Badge } from "@/components/ui/badge";

type JoinGroupProps = {
  data: PrayerGroupWithOwnerAndUsers[];
  userId: string;
};
export default function PrayerGroupJoin({ data, userId }: JoinGroupProps) {
  const columns: ColumnDef<PrayerGroupWithOwnerAndUsers>[] = [
    {
      accessorKey: "name",
      enableHiding: false,
      header: "Group Name",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <div className="font-bold"> {row.getValue("name")}</div>
          <Badge variant="outline">
            {row.original.groupType.charAt(0).toUpperCase() +
              row.original.groupType.slice(1).toLowerCase()}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "owner",
      enableHiding: false,
      header: () => (
        <div className="hidden lg:block">Owner</div> // Hides the column header on mobile
      ),
      cell: ({ row }) => {
        const owner: User = row.getValue("owner");

        return (
          <div className="capitalize hidden lg:block">
            {owner && owner.name && owner.image ? (
              <UserAvatar
                name={owner.name}
                email={owner.email}
                image={owner.image}
                includeEmail={false}
                size="small"
              />
            ) : (
              <div>-</div>
            )}
          </div>
        );
      },
    },
    {
      id: "join",
      enableHiding: false,
      cell: ({ row }) => {
        const groupId = row.original.id;
        return (
          <div className="flex gap-3 justify-end">
            <PrayerGroupDialog group={row.original} userId={userId} />
            <JoinGroup
              groupId={groupId}
              userId={userId}
              requestToJoin={row.original.groupType === GroupType.PRIVATE}
            />
          </div>
        );
      },
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
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Find a Group..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
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
            {table.getRowModel().rows?.length ? (
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
      <div className="flex items-top justify-between py-4">
        <div className="text-xs text-center text-muted-foreground pl-2">
          Private groups require approval to join.
        </div>
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
