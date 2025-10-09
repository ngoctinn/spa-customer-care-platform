// src/features/customer-schedules/types.ts
import { Appointment } from "@/features/appointment/types";
import {
  FullCustomerProfile,
  PurchasedService,
} from "@/features/customer/types";
import { Review } from "@/features/review/types";
import { Service } from "@/features/service/types";
import { FullStaffProfile } from "@/features/staff/types";
import { TreatmentPackage, TreatmentPlan } from "@/features/treatment/types";

/**
 * Định nghĩa một kiểu dữ liệu chung cho tất cả dữ liệu được fetch
 * bởi hook `useCustomerScheduleData`.
 * Gộp tất cả các props dữ liệu cần thiết cho các component con.
 */
export interface ScheduleDataProps {
  appointments: Appointment[];
  treatments: TreatmentPackage[];
  services: Service[];
  treatmentPlans: TreatmentPlan[];
  staff: FullStaffProfile[];
  reviews: Review[];
  currentUserProfile: FullCustomerProfile;
}

/**
 * Định nghĩa kiểu cho một item cần hành động trong ScheduleListView,
 * bao gồm dịch vụ lẻ đã mua hoặc liệu trình còn buổi chưa đặt lịch.
 */
export type ActionableItem =
  | { type: "service"; data: PurchasedService }
  | { type: "treatment"; data: TreatmentPackage };
