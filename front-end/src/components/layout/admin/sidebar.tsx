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
  UserPlus,
  CalendarOff,
  Wallet,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import React from "react";

// Định nghĩa kiểu cho các link để code chặt chẽ hơn
type NavLink = {
  href: string;
  label: string;
  icon: React.ElementType;
  sublinks?: NavLink[]; // Thêm thuộc tính sublinks tùy chọn
};

type NavGroup = {
  title: string;
  links: NavLink[];
};

// --- YÊU CẦU 1: PHÂN CẤP MENU ---
// Cấu trúc dữ liệu được tổ chức lại thành các nhóm (navGroups)
// và các mục menu con (sublinks) để tạo ra hệ thống phân cấp rõ ràng.
const navGroups: NavGroup[] = [
  {
    title: "Hoạt động",
    links: [
      { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
      {
        href: "/dashboard/pos",
        label: "Bán hàng tại quầy (POS)",
        icon: Wallet,
      },
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
      {
        href: "/dashboard/services",
        label: "Dịch vụ",
        icon: Scissors,
        sublinks: [
          // Menu Dịch vụ có các mục con
          {
            href: "/dashboard/services",
            label: "Danh sách",
            icon: ClipboardList,
          },
          {
            href: "/dashboard/services/new",
            label: "Thêm mới",
            icon: UserPlus,
          },
        ],
      },
      {
        href: "/dashboard/products",
        label: "Sản phẩm",
        icon: Tag,
        sublinks: [
          // Menu Sản phẩm có các mục con
          {
            href: "/dashboard/products",
            label: "Danh sách",
            icon: ClipboardList,
          },
          {
            href: "/dashboard/products/new",
            label: "Thêm mới",
            icon: UserPlus,
          },
        ],
      },
      { href: "/dashboard/treatments", label: "Liệu trình", icon: Sparkles },
    ],
  },
  // ... (các nhóm khác tương tự)
  {
    title: "Quản lý Kho",
    links: [
      {
        href: "/dashboard/inventory/overview",
        label: "Tổng quan",
        icon: Warehouse,
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
      {
        href: "/dashboard/time-off-requests",
        label: "Duyệt nghỉ phép",
        icon: CalendarOff,
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

  // Hàm kiểm tra xem một trong các menu con có đang active không
  const isSublinkActive = (sublinks: NavLink[] = []) => {
    return sublinks.some((sub) => pathname === sub.href);
  };

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

      {/* --- YÊU CẦU 3: TÍCH HỢP THANH CUỘN --- */}
      {/* ScrollArea bao bọc toàn bộ menu, với `flex-1` nó sẽ chiếm hết không gian còn lại
          và tự động hiển thị thanh cuộn khi nội dung vượt quá chiều cao. */}
      <ScrollArea className="flex-1">
        <nav className="p-4 space-y-4">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.links.map((link) =>
                  link.sublinks ? (
                    // NẾU CÓ SUBLINKS: Render menu `Collapsible`
                    <Collapsible
                      key={link.href}
                      // --- YÊU CẦU 2: TRẠNG THÁI ĐÓNG/MỞ ---
                      // Tự động mở menu nếu URL hiện tại bắt đầu bằng href của menu cha.
                      // Ví dụ: khi ở trang '/dashboard/services/new', menu 'Dịch vụ' sẽ mở.
                      open={pathname.startsWith(link.href)}
                      className="space-y-1"
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          // Đặt trạng thái active cho menu cha nếu có menu con đang active
                          variant={
                            isSublinkActive(link.sublinks)
                              ? "secondary"
                              : "ghost"
                          }
                          className="w-full justify-between"
                        >
                          <div className="flex items-center">
                            <link.icon className="mr-2 h-4 w-4" />
                            {link.label}
                          </div>
                          <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-6 space-y-1">
                        {link.sublinks.map((sublink) => (
                          <Button
                            key={sublink.href}
                            asChild
                            variant={
                              pathname === sublink.href ? "secondary" : "ghost"
                            }
                            className="w-full justify-start"
                          >
                            <Link href={sublink.href}>{sublink.label}</Link>
                          </Button>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    // NẾU KHÔNG CÓ SUBLINKS: Render Button như bình thường
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
                  )
                )}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
