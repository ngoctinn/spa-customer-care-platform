// src/features/user/components/PermissionsForm.tsx
"use client";

import { useFormContext, Controller } from "react-hook-form";
import { usePermissions } from "@/features/user/hooks/useRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";

export default function PermissionsForm() {
  const { control } = useFormContext();
  const { data: groupedPermissions, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Controller
        control={control}
        name="permissionIds"
        render={({ field }) => (
          <>
            {groupedPermissions &&
              Object.entries(groupedPermissions).map(
                ([groupName, permissions]) => (
                  <Card key={groupName}>
                    <CardHeader>
                      <CardTitle>{groupName}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {permissions.map((permission) => (
                        <FormItem
                          key={permission.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(permission.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...field.value,
                                      permission.id,
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value: string) =>
                                          value !== permission.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>{permission.name}</FormLabel>
                          </div>
                        </FormItem>
                      ))}
                    </CardContent>
                  </Card>
                )
              )}
            <FormMessage />
          </>
        )}
      />
    </div>
  );
}
