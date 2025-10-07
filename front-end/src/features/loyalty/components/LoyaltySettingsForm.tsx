// src/features/loyalty/components/LoyaltySettingsForm.tsx
"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { LoyaltySettingsFormValues } from "@/features/loyalty/schemas";
import { Textarea } from "@/components/ui/textarea";

export default function LoyaltySettingsForm() {
  const { control } = useFormContext<LoyaltySettingsFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tiers",
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tỷ lệ tích điểm</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="points_per_vnd"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số tiền (VND) để tích 1 điểm</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Các cấp bậc thành viên</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border rounded-md space-y-4 relative"
            >
              <h4 className="font-semibold">Cấp bậc #{index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name={`tiers.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên cấp bậc</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`tiers.${index}.point_goal`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Điểm cần đạt</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`tiers.${index}.color_hex`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã màu Hex</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input {...field} />
                          <div
                            className="w-8 h-8 rounded-md border"
                            style={{ backgroundColor: field.value }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={control}
                name={`tiers.${index}.benefits_description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả quyền lợi</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                name: "",
                point_goal: 0,
                color_hex: "#000000",
                benefits_description: "",
              })
            }
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm cấp bậc
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
