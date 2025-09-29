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
} from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
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
import { Input } from "@/components/ui/input"; // Assuming you have an Input component

// Giả sử đây là dữ liệu người dùng bạn lấy được sau khi đăng nhập
const user = {
  name: "Ngoc Tinn",
  email: "ngoctinn@example.com",
  avatarUrl: "https://github.com/shadcn.png",
};
const isLoggedIn = true; // Change this to test logged in/out states

const navLinks = [
  { href: "/services", label: "Dịch vụ" },
  { href: "/treatments", label: "Liệu trình" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/promotions", label: "Khuyến mãi" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
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
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.href}>
                <Link href={link.href} legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {link.label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Spacer to push items to the right */}
        <div className="flex-grow" />

        {/* Right side of the header */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm dịch vụ..."
              className="w-64 pl-9"
            />
          </div>

          {/* Booking Button */}
          <Button>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Đặt lịch ngay
          </Button>

          {/* User Avatar Dropdown or Login/Register */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl} alt={`@${user.name}`} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem>
                  <Link href="/dashboard" className="flex items-center w-full">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Trang điều khiển</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button asChild>
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" /> Đăng nhập
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/register">
                  <UserPlus className="mr-2 h-4 w-4" /> Đăng ký
                </Link>
              </Button>
            </div>
          )}

          {/* Shopping Cart */}
          <Button variant="ghost" size="icon">
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Giỏ hàng</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
