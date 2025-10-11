// src/features/inventory/components/warehouse-slips/CreateWarehouseSlipForm.tsx
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { useSlipFormStore } from "../../stores/slip-form.store";
import { ProductSelector } from "./ProductSelector";
import { useEffect } from "react";
import { Product } from "@/features/product/types";
import {
  importSlipSchema,
  exportSlipSchema,
  ImportSlipFormValues,
  ExportSlipFormValues,
} from "@/features/inventory/schemas/warehouse-slip.schema";
import { useSuppliers } from "../../hooks/useSuppliers";

interface CreateWarehouseSlipFormProps {
  type: "IMPORT" | "EXPORT";
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

type WarehouseSlipFormValues = ImportSlipFormValues | ExportSlipFormValues;

export function CreateWarehouseSlipForm({
  type,
  onSubmit,
  isSubmitting,
}: CreateWarehouseSlipFormProps) {
  const { items, addItem, removeItem, updateItem, clearItems } =
    useSlipFormStore();
  const isImport = type === "IMPORT";

  const { data: suppliers = [], isLoading: isLoadingSuppliers } =
    useSuppliers();

  const form = useForm<WarehouseSlipFormValues>({
    resolver: zodResolver(isImport ? importSlipSchema : exportSlipSchema),
    defaultValues: {
      items: [],
      ...(isImport && { supplier_id: "" }),
      notes: "",
    },
  });

  useEffect(() => {
    form.setValue("items", items);
  }, [items, form]);

  useEffect(() => {
    return () => clearItems();
  }, [clearItems]);

  const handleProductSelect = (product: Product) => {
    addItem(product, isImport);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * (item.unit_price || 0),
    0
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isImport && (
            <FormField
              control={form.control}
              name="supplier_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhà cung cấp</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingSuppliers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhà cung cấp..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((sup) => (
                        <SelectItem key={sup.id} value={sup.id}>
                          {sup.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className={!isImport ? "md:col-span-2" : ""}>
                <FormLabel>Ghi chú</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Thêm ghi chú cho phiếu..."
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel>Chi tiết sản phẩm</FormLabel>
          <FormField
            control={form.control}
            name="items"
            render={() => <FormMessage className="mt-2" />}
          />
          <div className="mt-2 p-4 border rounded-md">
            <ProductSelector onSelect={handleProductSelect} />
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="w-[120px]">Số lượng</TableHead>
                  {isImport && (
                    <TableHead className="w-[150px]">Đơn giá (VND)</TableHead>
                  )}
                  {isImport && (
                    <TableHead className="w-[150px]">
                      Thành tiền (VND)
                    </TableHead>
                  )}
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={isImport ? 5 : 3}
                      className="h-24 text-center"
                    >
                      Chưa có sản phẩm nào.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((item) => (
                  <TableRow key={item.product_id}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.product_id, {
                            quantity: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </TableCell>
                    {isImport && (
                      <>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            value={item.unit_price}
                            onChange={(e) =>
                              updateItem(item.product_id, {
                                unit_price: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("vi-VN").format(
                            (item.unit_price || 0) * item.quantity
                          )}
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.product_id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {isImport && (
          <div className="text-right text-lg font-bold">
            Tổng cộng: {new Intl.NumberFormat("vi-VN").format(totalAmount)} VND
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Tạo Phiếu"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
