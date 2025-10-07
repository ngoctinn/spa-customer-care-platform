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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Đơn hàng", icon: ShoppingCart },
  { href: "/dashboard/customers", label: "Khách hàng", icon: Users },
  { href: "/dashboard/appointments", label: "Lịch hẹn", icon: ClipboardList },
  { href: "/dashboard/staff", label: "Nhân viên", icon: UserCog },
  { href: "/dashboard/services", label: "Dịch vụ", icon: Scissors },
  { href: "/dashboard/products", label: "Sản phẩm", icon: Tag },
  { href: "/dashboard/treatments", label: "Liệu trình", icon: Sparkles },
  { href: "/dashboard/appointments", label: "Lịch hẹn", icon: ClipboardList },
  { href: "/dashboard/loyalty", label: "Khách hàng thân thiết", icon: Award },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-background">
      <div className="p-4 border-b">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-lg"
        >
          <Sparkles className="h-6 w-6 text-primary" />
          <span>Serenity Spa</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navLinks.map((link) => (
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
      </nav>
    </aside>
  );
}
