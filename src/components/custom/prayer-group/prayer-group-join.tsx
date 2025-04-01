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
import { PrayerGroupWithOwner } from "@/lib/utils";
import { User } from "@prisma/client";
import UserAvatar from "../user/user-avatar";
import JoinGroup from "../user/user-join-group";
import PrayerGroupDialog from "./prayer-group-dialog";

type JoinGroupProps = {
  data: PrayerGroupWithOwner[];
  userId: string;
};
export default function PrayerGroupJoin({ data, userId }: JoinGroupProps) {
  const columns: ColumnDef<PrayerGroupWithOwner>[] = [
    {
      accessorKey: "name",
      enableHiding: false,
      header: "Group Name",
      cell: ({ row }) => (
        <div className="capitalize font-bold">{row.getValue("name")}</div>
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
            <JoinGroup groupId={groupId} userId={userId} />
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
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
