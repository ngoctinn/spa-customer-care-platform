// src/features/appointment/hooks/useAppointmentFilters.ts
import { useState, useMemo } from "react";
import { Appointment } from "@/features/appointment/types";

export function useAppointmentFilters(appointments: Appointment[]) {
  const [filters, setFilters] = useState<{ [key: string]: string[] }>({
    technician: [],
    service: [],
    status: [],
  });

  const mockTable = {
    getColumn: (columnId: string) => ({
      getFilterValue: () => filters[columnId] || [],
      setFilterValue: (value: string[] | undefined) => {
        setFilters((prev) => ({ ...prev, [columnId]: value || [] }));
      },
      getFacetedUniqueValues: () => new Map(),
    }),
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const techMatch =
        filters.technician.length === 0 ||
        (apt.assigned_staff_ids &&
          filters.technician.includes(apt.assigned_staff_ids[0]));
      const serviceMatch =
        filters.service.length === 0 ||
        filters.service.includes(apt.service_id);
      const statusMatch =
        filters.status.length === 0 || filters.status.includes(apt.status);
      return techMatch && serviceMatch && statusMatch;
    });
  }, [appointments, filters]);

  return { mockTable, filteredAppointments };
}
