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
import UserView from "../functions/user-view";
import UserAvatar from "../user/user-avatar";

type UserInfo = Pick<User, "id" | "name" | "email" | "image" | "createdAt">;

type JoinGroupProps = {
  data: UserInfo[];
};
export function PrayerGroupMemberTable({ data }: JoinGroupProps) {
  const columns: ColumnDef<UserInfo>[] = [
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
            includeEmail={false}
          />
        );
      },
    },
    {
      accessorKey: "createdAt",
      enableHiding: false,
      header: () => (
        <div className="lg:block hidden">Joined</div> // Hides the column header on mobile
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
            <UserView id={row.original.id} variant="ghost" />
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
    <div className="flex flex-col gap-4 w-full">
      <div className="text-base font-bold">All Members</div>
      <div className="flex items-center">
        <Input
          placeholder="Find Member..."
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
