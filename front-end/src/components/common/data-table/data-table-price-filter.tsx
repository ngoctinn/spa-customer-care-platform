// src/components/common/data-table/data-table-price-filter.tsx
"use client";

import * as React from "react";
import { DollarSign, FilterX } from "lucide-react";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect, useMemo } from "react";

interface DataTablePriceFilterProps<TData> {
  table: Table<TData>;
  columnId?: string;
}

export function DataTablePriceFilter<TData>({
  table,
  columnId = "price",
}: DataTablePriceFilterProps<TData>) {
  const column = table.getColumn(columnId);

  const [value, setValue] = useState<[number, number]>([0, 10000000]);
  const [isOpen, setIsOpen] = useState(false);

  // Tìm giá trị min/max từ dữ liệu để đặt giới hạn cho slider
  const [min, max] = useMemo(() => {
    const prices = table
      .getPreFilteredRowModel()
      .rows.map((row) => row.getValue(columnId) as number);
    return [Math.min(0, ...prices), Math.max(...prices)];
  }, [table, columnId]);

  useEffect(() => {
    // Đặt giá trị mặc định cho slider khi có min/max
    if (min !== Infinity && max !== -Infinity) {
      setValue([min, max]);
    }
  }, [min, max]);

  const handleSliderChange = (newValue: number[]) => {
    setValue(newValue as [number, number]);
  };

  const applyFilter = () => {
    column?.setFilterValue(value);
    setIsOpen(false);
  };

  const resetFilter = () => {
    column?.setFilterValue(undefined);
    setValue([min, max]);
    setIsOpen(false);
  };

  const filterValue = column?.getFilterValue() as [number, number] | undefined;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <DollarSign className="mr-2 h-4 w-4" />
          Giá
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <p className="text-sm font-medium">Lọc theo khoảng giá</p>
          <Slider
            value={value}
            onValueChange={handleSliderChange}
            min={min}
            max={max}
            step={10000}
            minStepsBetweenThumbs={1}
          />
          <div className="flex items-center justify-between gap-4">
            <Input
              type="text"
              value={new Intl.NumberFormat("vi-VN").format(value[0])}
              onChange={(e) => {
                const num = Number(e.target.value.replace(/\D/g, ""));
                setValue([num, value[1]]);
              }}
              className="h-8"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="text"
              value={new Intl.NumberFormat("vi-VN").format(value[1])}
              onChange={(e) => {
                const num = Number(e.target.value.replace(/\D/g, ""));
                setValue([value[0], num]);
              }}
              className="h-8"
            />
          </div>
          <div className="flex justify-between">
            {filterValue && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilter}
                className="text-destructive hover:text-destructive"
              >
                <FilterX className="mr-2 h-4 w-4" />
                Xóa lọc giá
              </Button>
            )}
            <Button onClick={applyFilter} size="sm" className="ml-auto">
              Áp dụng
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
