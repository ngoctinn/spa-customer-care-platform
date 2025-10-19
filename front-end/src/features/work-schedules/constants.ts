// src/features/work-schedules/constants.ts
import { FlexibleSchedule } from "./types";

export const statusColors: Record<FlexibleSchedule["status"], string> = {
  pending: "hsl(var(--warning))",
  approved: "hsl(var(--success))",
  rejected: "hsl(var(--destructive))",
};
