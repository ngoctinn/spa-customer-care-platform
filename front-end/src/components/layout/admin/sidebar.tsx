"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { adminBrand, adminNavigation } from "@/config/admin-navigation";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  /**
   * Desktop sidebar is hidden on smaller breakpoints while mobile variant is
   * rendered inside a sheet/drawer.
   */
  variant?: "desktop" | "mobile";
  className?: string;
  onNavigate?: () => void;
};

export function AdminSidebar({
  variant = "desktop",
  className,
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const BrandIcon = adminBrand.icon;

  const getIsActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className={cn(
        "flex w-64 flex-col bg-background",
        variant === "desktop"
          ? "hidden border-r lg:flex"
          : "flex border-r border-border/60 lg:hidden",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b p-4 font-semibold text-lg">
        <Link
          href={adminBrand.href}
          className="flex items-center gap-2"
          onClick={() => onNavigate?.()}
        >
          <BrandIcon className="h-6 w-6 text-primary" aria-hidden="true" />
          <span>{adminBrand.name}</span>
        </Link>
      </div>
      <nav aria-label="Điều hướng quản trị" className="flex-1 space-y-2 p-4">
        {adminNavigation.map((item) => {
          const isActive = getIsActive(item.href, item.exact);
          const Icon = item.icon;

          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
            >
              <Link href={item.href} onClick={() => onNavigate?.()}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
                {isActive && (
                  <span className="sr-only">(đang chọn)</span>
                )}
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
