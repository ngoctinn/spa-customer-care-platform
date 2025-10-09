"use client";

import { AdminHeader } from "@/components/layout/admin/header";
import { AdminSidebar } from "@/components/layout/admin/sidebar";
import { MediaLibraryModal } from "@/features/media/components/MediaLibraryModal";
import { MediaImage } from "@/features/media/types";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleImageSelect = (image: MediaImage) => {
    // This function will be dynamically overridden by the component that opens the modal
    if (typeof (window as any).onMediaSelect === "function") {
      (window as any).onMediaSelect(image);
    }
  };
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[256px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-4 lg:p-6 bg-muted/40">{children}</main>
      </div>
      <MediaLibraryModal onSelectImage={handleImageSelect} />
    </div>
  );
}
