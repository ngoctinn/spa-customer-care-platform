import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  LayoutDashboard,
  Scissors,
  ShoppingCart,
  Sparkles,
  Tag,
  UserCog,
  Users,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const adminBrand = {
  name: "Serenity Spa",
  href: "/dashboard",
  icon: Sparkles,
};

export const adminNavigation: AdminNavItem[] = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/orders", label: "Đơn hàng", icon: ShoppingCart },
  { href: "/dashboard/customers", label: "Khách hàng", icon: Users },
  { href: "/dashboard/appointments", label: "Lịch hẹn", icon: ClipboardList },
  { href: "/dashboard/staff", label: "Nhân viên", icon: UserCog },
  { href: "/dashboard/services", label: "Dịch vụ", icon: Scissors },
  { href: "/dashboard/products", label: "Sản phẩm", icon: Tag },
  { href: "/dashboard/treatments", label: "Liệu trình", icon: Sparkles },
];
