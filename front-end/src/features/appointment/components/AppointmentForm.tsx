"use client";

import { useFormContext } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

// Import các hooks để lấy danh sách
import { useCustomers } from "@/features/customer/hooks/useCustomers";
import { useServices } from "@/features/service/hooks/useServices";
import { useStaff } from "@/features/staff/hooks/useStaff";
import React from "react";
import {
  useBeds,
  useEquipments,
  useRooms,
} from "@/features/resources/hooks/useResources";

export default function AppointmentForm() {
  const { control, setValue, watch } = useFormContext();

  // Lấy dữ liệu cho các dropdown
  const { data: customers = [], isLoading: isLoadingCustomers } =
    useCustomers();
  const { data: services = [], isLoading: isLoadingServices } = useServices();
  const { data: staffList = [], isLoading: isLoadingStaff } = useStaff();
  const { data: rooms = [], isLoading: isLoadingRooms } = useRooms();
  const { data: beds = [], isLoading: isLoadingBeds } = useBeds();
  const { data: equipments = [], isLoading: isLoadingEquipments } =
    useEquipments();
  const selectedStaffIds = watch("assigned_staff_ids") || [];
  const selectedMobileEquipmentIds =
    watch("assigned_mobile_equipment_ids") || [];
  return (
    <div className="space-y-4">
      {/* Customer Selection */}
      <FormField
        control={control}
        name="customer_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Khách hàng</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={isLoadingCustomers}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khách hàng..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.full_name} ({customer.phone_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Service Selection */}
      <FormField
        control={control}
        name="service_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dịch vụ</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={isLoadingServices}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn dịch vụ..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* THAY ĐỔI: Multi-select cho nhân viên */}
      <FormField
        control={control}
        name="assigned_staff_ids"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nhân viên thực hiện</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between h-auto",
                      !field.value?.length && "text-muted-foreground"
                    )}
                  >
                    <div className="flex gap-1 flex-wrap">
                      {selectedStaffIds.length > 0
                        ? staffList
                            .filter((staff) =>
                              selectedStaffIds.includes(staff.id)
                            )
                            .map((staff) => (
                              <Badge key={staff.id} variant="secondary">
                                {staff.full_name}
                              </Badge>
                            ))
                        : "Chọn nhân viên..."}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Tìm nhân viên..." />
                  <CommandEmpty>Không tìm thấy.</CommandEmpty>
                  <CommandGroup>
                    {staffList.map((staff) => (
                      <CommandItem
                        key={staff.id}
                        onSelect={() => {
                          const currentIds = field.value || [];
                          const newIds = currentIds.includes(staff.id)
                            ? currentIds.filter((id: string) => id !== staff.id)
                            : [...currentIds, staff.id];
                          setValue("assigned_staff_ids", newIds);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value?.includes(staff.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {staff.full_name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="assigned_room_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phòng</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoadingRooms}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="assigned_bed_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giường</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoadingBeds}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giường..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {beds.map((bed) => (
                    <SelectItem key={bed.id} value={bed.id}>
                      {bed.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="assigned_mobile_equipment_ids"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Thiết bị di động</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between h-auto",
                      !field.value?.length && "text-muted-foreground"
                    )}
                  >
                    <div className="flex gap-1 flex-wrap">
                      {selectedMobileEquipmentIds.length > 0
                        ? equipments
                            .filter((eq) =>
                              selectedMobileEquipmentIds.includes(eq.id)
                            )
                            .map((eq) => (
                              <Badge key={eq.id} variant="secondary">
                                {eq.name}
                              </Badge>
                            ))
                        : "Chọn thiết bị..."}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Tìm thiết bị..." />
                  <CommandEmpty>Không tìm thấy.</CommandEmpty>
                  <CommandGroup>
                    {equipments
                      .filter((eq) => eq.type === "MOBILE")
                      .map((eq) => (
                        <CommandItem
                          key={eq.id}
                          onSelect={() => {
                            const currentIds = field.value || [];
                            const newIds = currentIds.includes(eq.id)
                              ? currentIds.filter((id: string) => id !== eq.id)
                              : [...currentIds, eq.id];
                            setValue("assigned_mobile_equipment_ids", newIds);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value?.includes(eq.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {eq.name}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Date Time Picker */}
      <FormField
        control={control}
        name="start_time"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Thời gian hẹn</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP HH:mm")
                    ) : (
                      <span>Chọn ngày giờ</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Notes */}
      <FormField
        control={control}
        name="customer_note"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ghi chú của khách</FormLabel>
            <FormControl>
              <Textarea placeholder="Nhập ghi chú nếu có..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
