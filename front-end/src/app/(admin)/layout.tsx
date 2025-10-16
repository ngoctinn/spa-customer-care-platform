// src/app/(admin)/layout.tsx
"use client";

import { AdminHeader } from "@/components/layout/admin/header";
import { AdminSidebar } from "@/components/layout/admin/sidebar";
import { MediaLibraryModal } from "@/features/media/components/MediaLibraryModal";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[256px_1fr]">
      {/* Sidebar này chỉ hiển thị trên màn hình lớn (lg) */}
      <AdminSidebar className="hidden lg:flex" />
      <div className="flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-4 lg:p-6 bg-muted/40">{children}</main>
      </div>
      <MediaLibraryModal />
    </div>
  );
}
