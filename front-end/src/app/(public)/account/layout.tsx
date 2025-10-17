"use client";

import {
  User,
  ShoppingBag,
  Calendar,
  Lock,
  LucideIcon,
  CalendarCheck,
  Award,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navLinks: NavLink[] = [
  { href: "/account", label: "Thông tin cá nhân", icon: User },
  {
    href: "/account/my-schedule",
    label: "Lịch trình của tôi",
    icon: CalendarCheck,
  },
  {
    href: "/account/order-history",
    label: "Lịch sử mua hàng",
    icon: ShoppingBag,
  },
  {
    href: "/account/appointment-history",
    label: "Lịch sử đặt hẹn",
    icon: Calendar,
  },
  {
    href: "/account/loyalty-history",
    label: "Lịch sử điểm thưởng",
    icon: Award,
  },
  { href: "/account/change-password", label: "Đổi mật khẩu", icon: Lock },
];

function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            pathname === link.href && "bg-muted text-primary"
          )}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-12">
      <div className="grid md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr] gap-12 items-start">
        <aside>
          <AccountSidebar />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
