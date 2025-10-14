// src/features/staff/hooks/useCurrentStaffProfile.ts
import { useMemo } from "react";
import { useAuth } from "@/features/auth/contexts/AuthContexts";
import { useStaff } from "./useStaff";

/**
 * Hook để lấy Staff Profile của người dùng đang đăng nhập.
 * @returns { staffProfile, isLoading }
 */
export const useCurrentStaffProfile = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: staffList = [], isLoading: isStaffLoading } = useStaff();

  const staffProfile = useMemo(() => {
    if (!user || staffList.length === 0) {
      return null;
    }
    // Tìm profile nhân viên dựa trên user.id của người dùng đang đăng nhập
    return staffList.find((staff) => staff.user.id === user.id) || null;
  }, [user, staffList]);

  return {
    staffProfile,
    isLoading: isAuthLoading || isStaffLoading,
  };
};
