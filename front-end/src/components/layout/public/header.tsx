// src/components/layout/public/header.tsx

"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
  CalendarPlus,
  Menu,
  Moon,
  Sun,
  UserCircle2,
  User,
} from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import useCartStore from "@/features/cart/stores/cart-store";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/contexts/AuthContexts";
import { useRouter } from "next/navigation";
import { useCustomerProfile } from "@/features/customer/hooks/useCustomerProfile";

const navLinks = [
  { href: "/services", label: "Dịch vụ" },
  { href: "/treatment-plans", label: "Liệu trình" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/promotions", label: "Khuyến mãi" },
  { href: "/about", label: "Giới thiệu" },
];

// REFACTOR: SearchInput component
const SearchInput = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;

    const params = new URLSearchParams({ q: searchQuery.trim() });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="relative flex-1 md:flex-none"
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Tìm kiếm..."
        className="w-full md:w-64 pl-9"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </form>
  );
};

export function Header() {
  const { setTheme, theme } = useTheme();
  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

  const { data: customerProfile } = useCustomerProfile();

  const { items } = useCartStore();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-center px-4">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Mở menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                    <span className="font-bold">SpaCare</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 py-6">
                {navLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className="justify-start"
                    asChild
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}
              </div>
              <Separator />
              <div className="py-6">
                <Button className="w-full">
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Đặt lịch
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Link href="/" className="mr-6 flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="font-bold">SpaCare</span>
        </Link>

        {/* Navbar */}
        <NavigationMenu className="hidden md:flex flex-1 justify-center whitespace-nowrap">
          <NavigationMenuList>
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink asChild>
                  <Link href={link.href}>{link.label}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          <SearchInput />

          <Button className="hidden md:flex items-center gap-2">
            <Link href="/booking" className="flex items-center gap-2">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Đặt lịch
            </Link>
          </Button>

          {/* User Avatar Dropdown or Login/Register */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  {isLoggedIn ? (
                    <>
                      <AvatarImage
                        src={customerProfile?.avatar_url ?? ""}
                        alt={customerProfile?.full_name ?? "User"}
                      />
                      <AvatarFallback>
                        {customerProfile?.full_name?.charAt(0).toUpperCase() ||
                          user?.email.charAt(0).toUpperCase() ||
                          "A"}
                      </AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback>
                      <UserCircle2 className="h-6 w-6 text-muted-foreground" />
                    </AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              {isLoggedIn ? (
                <>
                  <DropdownMenuItem>
                    <Link href="/account" className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Tài khoản của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href="/dashboard"
                      className="flex items-center w-full"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Trang điều khiển</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleThemeToggle}>
                    {theme === "light" ? (
                      <Moon className="mr-2 h-4 w-4" />
                    ) : (
                      <Sun className="mr-2 h-4 w-4" />
                    )}
                    <span>
                      {theme === "light" ? "Chế độ tối" : "Chế độ sáng"}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => void logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem>
                    <Link
                      href="/auth/login"
                      className="flex items-center w-full"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      <span>Đăng nhập</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href="/auth/register"
                      className="flex items-center w-full"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      <span>Đăng ký</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleThemeToggle}>
                    {theme === "light" ? (
                      <Moon className="mr-2 h-4 w-4" />
                    ) : (
                      <Sun className="mr-2 h-4 w-4" />
                    )}
                    <span>
                      {theme === "light" ? "Chế độ tối" : "Chế độ sáng"}
                    </span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Shopping Cart */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0"
                >
                  {totalItems}
                </Badge>
              )}
              <span className="sr-only">Giỏ hàng</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
