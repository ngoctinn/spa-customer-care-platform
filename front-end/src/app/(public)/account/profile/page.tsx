// src/app/(public)/account/profile/page.tsx
import { ProfileForm } from "@/features/customer/components/dashboard/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <ProfileForm />
      {/* Thêm các card khác cho địa chỉ, sở thích ở đây */}
    </div>
  );
}
