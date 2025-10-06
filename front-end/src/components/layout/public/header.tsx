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
import { Input } from "@/components/ui/input"; // Assuming you have an Input component
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
import { useAuth } from "@/contexts/AuthContexts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";

const navLinks = [
  { href: "/services", label: "Dịch vụ" },
  { href: "/treatment-plans", label: "Liệu trình" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/promotions", label: "Khuyến mãi" },
  { href: "/about", label: "Giới thiệu" },
];

export function Header() {
  const { setTheme, theme } = useTheme();
  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

  const { items, lastAddedItem, clearLastAddedItem } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const [isCartPopoverOpen, setIsCartPopoverOpen] = React.useState(false);

  // Lắng nghe sự thay đổi của lastAddedItem
  React.useEffect(() => {
    if (lastAddedItem) {
      setIsCartPopoverOpen(true);
      const timer = setTimeout(() => {
        setIsCartPopoverOpen(false);
        clearLastAddedItem(); // Xóa item sau khi popover đóng
      }, 3000); // Tự động đóng sau 3 giây

      return () => clearTimeout(timer);
    }
  }, [lastAddedItem, clearLastAddedItem]);
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
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm sản phẩm, dịch vụ..."
              className="w-64 pl-9"
            />
          </div>

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
                        src={user?.avatar_url ?? ""}
                        alt={`@${user?.full_name ?? "user"}`}
                      />
                      <AvatarFallback>
                        {user?.full_name?.charAt(0) ??
                          user?.email?.charAt(0) ??
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

          <Popover open={isCartPopoverOpen} onOpenChange={setIsCartPopoverOpen}>
            <PopoverTrigger asChild>
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
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              {lastAddedItem ? (
                <div>
                  <p className="text-sm font-medium mb-2">Vừa thêm vào giỏ:</p>
                  <div className="flex items-start gap-4">
                    <Image
                      src={lastAddedItem.imageUrl}
                      alt={lastAddedItem.name}
                      width={64}
                      height={64}
                      className="rounded-md border object-contain"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold line-clamp-2">
                        {lastAddedItem.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.NumberFormat("vi-VN").format(
                          lastAddedItem.price
                        )}{" "}
                        VNĐ
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Chưa có sản phẩm nào được thêm gần đây.
                </p>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
