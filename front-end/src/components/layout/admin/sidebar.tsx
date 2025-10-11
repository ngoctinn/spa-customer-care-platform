// src/components/layout/admin/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  ClipboardList,
  Tag,
  Sparkles,
  Scissors,
  UserCog,
  Award,
  ShieldCheck,
  CalendarClock,
  Warehouse,
  ClipboardSignature,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Cấu trúc dữ liệu mới cho việc gom nhóm
const navGroups = [
  {
    title: "Hoạt động",
    links: [
      { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
      {
        href: "/dashboard/appointments",
        label: "Lịch hẹn",
        icon: ClipboardList,
      },
      { href: "/dashboard/orders", label: "Đơn hàng", icon: ShoppingCart },
    ],
  },
  {
    title: "Quản lý Spa",
    links: [
      { href: "/dashboard/services", label: "Dịch vụ", icon: Scissors },
      { href: "/dashboard/products", label: "Sản phẩm", icon: Tag },
      { href: "/dashboard/treatments", label: "Liệu trình", icon: Sparkles },
    ],
  },
  {
    title: "Quản lý Kho",
    links: [
      {
        href: "/dashboard/inventory/overview",
        label: "Tổng quan",
        icon: Warehouse,
      },
      {
        href: "/dashboard/products", // Tạm thời trỏ đến trang sản phẩm
        label: "Tồn kho",
        icon: Tag,
      },
      {
        href: "/dashboard/inventory/warehouse-slips",
        label: "Phiếu Nhập/Xuất",
        icon: ClipboardSignature,
      },
      {
        href: "/dashboard/inventory/suppliers",
        label: "Nhà cung cấp",
        icon: Truck,
      },
    ],
  },
  {
    title: "Nhân sự",
    links: [
      { href: "/dashboard/staff", label: "Nhân viên", icon: UserCog },
      {
        href: "/dashboard/roles",
        label: "Vai trò & Phân quyền",
        icon: ShieldCheck,
      },
      {
        href: "/dashboard/schedules",
        label: "Lịch làm việc",
        icon: CalendarClock,
      },
    ],
  },
  {
    title: "Khách hàng",
    links: [
      { href: "/dashboard/customers", label: "Danh sách", icon: Users },
      { href: "/dashboard/loyalty", label: "Thành viên", icon: Award },
    ],
  },
];

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn("flex flex-col w-64 border-r bg-background", className)}
    >
      <div className="p-4 border-b">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-lg"
        >
          <Sparkles className="h-6 w-6 text-primary" />
          <span>Serenity Spa</span>
        </Link>
      </div>
      {/* Sử dụng ScrollArea để tránh tràn layout nếu có nhiều mục menu */}
      <ScrollArea className="flex-1">
        <nav className="p-4 space-y-4">
          {/* Duyệt qua từng nhóm */}
          {navGroups.map((group) => (
            <div key={group.title}>
              {/* Hiển thị tiêu đề nhóm */}
              <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.title}
              </h3>
              <div className="space-y-1">
                {/* Duyệt qua các link trong nhóm */}
                {group.links.map((link) => (
                  <Button
                    key={link.href}
                    asChild
                    variant={pathname === link.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Link href={link.href}>
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
