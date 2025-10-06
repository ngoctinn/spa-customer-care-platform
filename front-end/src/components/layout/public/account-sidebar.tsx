// src/components/layout/public/account-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Calendar, Package, Heart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/account/profile", label: "Thông tin cá nhân", icon: User },
  { href: "/account/appointments", label: "Lịch hẹn của tôi", icon: Calendar },
  {
    href: "/account/treatment-plans",
    label: "Liệu trình đã mua",
    icon: Package,
  },
  { href: "/account/preferences", label: "Sở thích", icon: Heart },
  { href: "/account/settings", label: "Cài đặt", icon: Settings },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 lg:pr-8">
      <nav className="flex flex-row lg:flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
