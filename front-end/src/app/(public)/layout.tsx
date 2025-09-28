import Footer from "@/components/layout/public/footer";
import { Header } from "@/components/layout/public/header";
import { ThemeProvider } from "next-themes";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Header />

        <main>{children}</main>
        <Footer />
      </ThemeProvider>
    </div>
  );
}
