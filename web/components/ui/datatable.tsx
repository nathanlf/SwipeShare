"use client";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableRow } from "./table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}
export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  //const first = True;
  return (
    <div className="rounded-md ">
      <Table className="gap-2 border-separate border-spacing-y-0.5">
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => {
              const color = Number.isInteger(index / 2)
                ? "bg-[#3bbf904d] dark:bg-[#40cf9d6e] !rounded-md border-none hover:bg-[#3bbf9040]"
                : "bg-[#3bbf9026] dark:bg-[#3bbf904d] !rounded-md border-none hover:bg-[#3bbf901a]";
              return (
                <TableRow
                  className={color}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className="rounded-md py-0.5 leading-6 my-5"
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow className="bg-accent1-muted hover:bg-accent1-muted">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No Availability Set.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
