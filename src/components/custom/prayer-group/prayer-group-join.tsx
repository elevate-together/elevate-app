"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PrayerGroupWithOwner } from "@/lib/utils";
import { addUserToPrayerGroup } from "@/services/user-prayer-group";
import { User } from "@prisma/client";
import { Star } from "lucide-react";
import ViewGroup from "../functions/view-group";
import UserAvatar from "../user/user-avatar";

type JoinGroupProps = {
  data: PrayerGroupWithOwner[];
  userId: string;
};
export function PrayerGroupJoin({ data, userId }: JoinGroupProps) {
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
      accessorKey: "owner", // Accessing the 'name' field inside the 'owner' object
      enableHiding: false,
      header: "Owner", // Column header
      cell: ({ row }) => {
        const owner: User = row.getValue("owner");

        return (
          <div className="capitalize">
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

        const joinGroup = async () => {
          try {
            const response = await addUserToPrayerGroup(userId, groupId);
            if (response.success) {
              toast.success(response.message);
            } else {
              toast.error(response.message);
            }
          } catch (error) {
            console.error("An error occurred:", error);
            toast.error(
              "An unexpected error occurred while joining the group."
            );
          }
        };

        return (
          <div className="flex gap-3 justify-end">
            <ViewGroup group={row.original} />
            <Button className="p-2" onClick={joinGroup}>
              <Star />
              Join
            </Button>
          </div>
        );
      },
    },
  ];

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
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
