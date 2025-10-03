// src/app/(public)/layout.tsx
import Footer from "@/components/layout/public/footer";
import { Header } from "@/components/layout/public/header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>{" "}
      {/* Thêm flex-1 để footer luôn ở cuối */}
      <Footer />
    </div>
  );
}
