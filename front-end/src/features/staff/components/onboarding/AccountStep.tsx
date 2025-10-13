"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoles } from "@/features/user/hooks/useRoles";
import { StaffOnboardingFormValues } from "../../schemas";

export default function AccountStep() {
  const { control } = useFormContext<StaffOnboardingFormValues>();
  const { data: roles = [], isLoading: isLoadingRoles } = useRoles();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="account.email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Nhân viên</FormLabel>
            <FormControl>
              <Input type="email" placeholder="email@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="account.role_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vai trò</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger disabled={isLoadingRoles}>
                  <SelectValue placeholder="Chọn vai trò cho nhân viên" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {isLoadingRoles ? (
                  <SelectItem value="loading" disabled>
                    Đang tải...
                  </SelectItem>
                ) : (
                  roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
