// src/features/appointment/components/AppointmentFilters.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DataTableFacetedFilter } from "@/components/common/data-table/data-table-faceted-filter";
import { FullStaffProfile } from "@/features/staff/types";
import { Service } from "@/features/service/types";
import { Table } from "@tanstack/react-table";
import { Appointment } from "@/features/appointment/types";
import { statusOptions } from "@/features/appointment/constants";

interface AppointmentFiltersProps {
  table: Table<Appointment>;
  staffList: FullStaffProfile[];
  services: Service[];
}

export function AppointmentFilters({
  table,
  staffList,
  services,
}: AppointmentFiltersProps) {
  const technicianOptions = staffList.map((s) => ({
    label: s.full_name,
    value: s.id,
  }));
  const serviceOptions = services.map((s) => ({ label: s.name, value: s.id }));

  // Không cần định nghĩa lại statusOptions ở đây nữa

  return (
    <Card className="mb-4">
      <CardContent className="p-2 flex flex-wrap items-center gap-2">
        <DataTableFacetedFilter
          column={table.getColumn("assigned_staff_ids")}
          title="Kỹ thuật viên"
          options={technicianOptions}
        />
        <DataTableFacetedFilter
          column={table.getColumn("service_id")}
          title="Dịch vụ"
          options={serviceOptions}
        />
        <DataTableFacetedFilter
          column={table.getColumn("status")}
          title="Trạng thái"
          options={statusOptions} // Sử dụng hằng số đã import
        />
      </CardContent>
    </Card>
  );
}
