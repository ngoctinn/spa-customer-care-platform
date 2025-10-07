import { ChangePasswordForm } from "@/features/customer/components/dashboard/ChangePasswordForm";
export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Bảo mật</h2>
        <p className="text-muted-foreground mt-1">
          Quản lý mật khẩu và các tùy chọn bảo mật tài khoản.
        </p>
      </header>

      <ChangePasswordForm />

      {/* Trong tương lai, bạn có thể thêm các tùy chọn khác như 2FA ở đây */}
    </div>
  );
}
