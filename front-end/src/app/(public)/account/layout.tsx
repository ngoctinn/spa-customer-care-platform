"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutDashboard, History, Shield } from "lucide-react";

interface AccountLayoutProps {
  children: ReactNode;
}

const sidebarNavItems = [
  {
    title: "Tổng quan",
    href: "/account",
    icon: <LayoutDashboard className="w-4 h-4 mr-2" />,
  },
  {
    title: "Lịch sử mua hàng",
    href: "/account/order-history",
    icon: <History className="w-4 h-4 mr-2" />,
  },
  {
    title: "Bảo mật",
    href: "/account/security",
    icon: <Shield className="w-4 h-4 mr-2" />,
  },
];

export default function AccountLayout({ children }: AccountLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  pathname === item.href
                    ? "bg-muted hover:bg-muted"
                    : "hover:bg-transparent hover:underline",
                  "w-full justify-start"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 lg:max-w-4xl">{children}</main>
      </div>
    </div>
  );
}
