"use client";

import {type FC, type ReactNode} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@UI/table.tsx";
import {
    type Column,
    type ColumnDef,
    type ColumnFiltersState,
    flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel,
    type SortingState,
    type Table as TableType, useReactTable,
    type VisibilityState
} from "@tanstack/react-table";
import {Button} from "@UI/button.tsx";
import {ArrowUpDown} from "lucide-react";
import * as React from "react";

interface Props<T = any> {
    data: T[];
    columns: ColumnDef<T>[];
    pagination?: boolean;
}

interface PaginationProps {
    table: TableType<any>;
}
interface SortableHeaderProps {
    column: Column<any>;
    children:ReactNode | ReactNode[]
}

/*
TODO : -add all required options for this component
 */
const SimpleTable: FC<Props> = (props) => {
    const {data , columns, pagination = false} = props;

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    );
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div>
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
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
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
            {pagination && <TablePagination table={table} />}
        </div>
    );
};

const TablePagination: FC<PaginationProps> = ({table}) => {
    return <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
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
    </div>;
};

export const SortableTableHeader:FC<SortableHeaderProps> = ({column , children}) => (
    <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4"/>
    </Button>
);
export default SimpleTable;

