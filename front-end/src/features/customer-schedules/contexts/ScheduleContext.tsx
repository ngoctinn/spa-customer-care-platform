// src/features/customer-schedules/contexts/ScheduleContext.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { useCustomerScheduleData } from "@/features/customer-schedules/hooks/useCustomerScheduleData";
import { ScheduleDataProps } from "@/features/customer-schedules/types";
import { FullPageLoader } from "@/components/ui/spinner";

// 1. Định nghĩa kiểu cho giá trị của Context
interface ScheduleContextType extends ScheduleDataProps {
  // Bạn có thể thêm các hàm cập nhật dữ liệu ở đây nếu cần
}

// 2. Tạo Context với giá trị mặc định là undefined
const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined
);

// 3. Tạo Provider Component
interface ScheduleProviderProps {
  children: ReactNode;
}

export function ScheduleProvider({ children }: ScheduleProviderProps) {
  // Gọi hook để lấy tất cả dữ liệu cần thiết
  const { data, isLoading } = useCustomerScheduleData();

  // Hiển thị loading spinner trong khi chờ dữ liệu
  if (isLoading || !data) {
    return <FullPageLoader text="Đang tải dữ liệu lịch hẹn..." />;
  }

  // Cung cấp dữ liệu xuống các component con
  return (
    <ScheduleContext.Provider value={data}>{children}</ScheduleContext.Provider>
  );
}

// 4. Tạo Custom Hook để dễ dàng truy cập Context
export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
}
