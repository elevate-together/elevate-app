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
import { User } from "@prisma/client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import UserAvatar from "../user/user-avatar";
import PrayerGroupUpdateStatus from "./prayer-group-accept";
import PrayerGroupDecline from "./prayer-group-decline";

type JoinGroupProps = {
  data: User[];
  groupId: string;
};
export default function PrayerGroupPendingTable({
  data,
  groupId,
}: JoinGroupProps) {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      enableHiding: false,
      header: "User",
      cell: ({ row }) => {
        return (
          <UserAvatar
            name={row.original.name}
            email={row.original.email}
            image={row.original.image ?? undefined}
            size="small"
            profileUrl={`/user/${row.original.id}`}
          />
        );
      },
    },
    {
      accessorKey: "email",
      enableHiding: false,
      header: () => <div className="lg:block hidden">Email</div>,
      cell: ({ row }) => {
        return (
          <div className=" lg:block hidden">
            <div className="font-medium invisible md:visible">
              {row.original.email}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      enableHiding: false,
      header: () => (
        <div className="lg:block hidden">Request Date</div> // Hides the column header on mobile
      ),
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
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <PrayerGroupDecline userId={row.original.id} groupId={groupId} />
            <PrayerGroupUpdateStatus
              userId={row.original.id}
              groupId={groupId}
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
    <div className="flex flex-col gap-4 w-full mt-5">
      <div>
        <div className="text-base font-bold mb-1">Pending Members</div>
        <div className="text-muted-foreground text-sm">
          Review and approve or decline requests from users wanting to join the
          group. Accepted members will gain access to all group prayer requests.
        </div>
      </div>
      <div className="flex items-center">
        <Input
          placeholder="Search..."
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

      <div className="flex items-center justify-between ">
        <div className="text-xs text-center text-muted-foreground">{`Member Count: ${data.length}`}</div>
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
