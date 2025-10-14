// src/features/staff/hooks/useStaff.ts
import { useQuery } from "@tanstack/react-query";
import {
  getStaffList,
  getStaffById,
  getTechniciansByService,
} from "@/features/staff/api/staff.api";
import { FullStaffProfile } from "@/features/staff/types";

const queryKey = ["staffList"];

export const useStaff = () => {
  return useQuery<FullStaffProfile[]>({
    queryKey: queryKey,
    queryFn: getStaffList,
  });
};

export const useStaffById = (staffId: string) => {
  return useQuery<FullStaffProfile>({
    queryKey: ["staff", staffId],
    queryFn: () => getStaffById(staffId),
    enabled: !!staffId,
  });
};

export const useTechniciansByService = (serviceId?: string) => {
  return useQuery<FullStaffProfile[]>({
    queryKey: ["technicians", serviceId],
    queryFn: () => getTechniciansByService(serviceId!),
    enabled: !!serviceId,
  });
};
