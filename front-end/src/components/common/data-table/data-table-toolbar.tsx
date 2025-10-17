// src/components/common/data-table/data-table-toolbar.tsx
"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, SlidersHorizontal } from "lucide-react";
import { DataTableViewOptions } from "@/components/common/data-table/data-table-view-options";
import {
  DataTableFacetedFilter,
  FacetedFilterOption,
} from "./data-table-faceted-filter";

export interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchColumnId: string;
  searchPlaceholder?: string;
  facetedFilters?: {
    columnId: string;
    title: string;
    options: FacetedFilterOption[];
  }[];
  onDeleteSelected?: (selectedRows: TData[]) => void;
  onAdjustStockClick?: () => void;
  CustomActions?: React.ComponentType<{ table: Table<TData> }>;
}

export function DataTableToolbar<TData>({
  table,
  searchColumnId,
  searchPlaceholder = "Tìm kiếm...",
  facetedFilters = [],
  onDeleteSelected,
  onAdjustStockClick,
  CustomActions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRowsData = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);
  const hasRowsSelected = selectedRowsData.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={searchPlaceholder}
          value={
            (table.getColumn(searchColumnId)?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn(searchColumnId)?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {facetedFilters.map((filter) => (
          <DataTableFacetedFilter
            key={filter.columnId}
            column={table.getColumn(filter.columnId)}
            title={filter.title}
            options={filter.options}
          />
        ))}
        {CustomActions && <CustomActions table={table} />}
      </div>
      <div className="flex items-center space-x-2">
        {onAdjustStockClick && (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={onAdjustStockClick}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Điều chỉnh kho
          </Button>
        )}

        {hasRowsSelected && onDeleteSelected && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => onDeleteSelected(selectedRowsData)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa ({selectedRowsData.length})
          </Button>
        )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
