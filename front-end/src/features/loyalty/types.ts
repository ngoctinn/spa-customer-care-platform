
export interface LoyaltyTier {
  id: string;
  name: string; // Ví dụ: "Đồng", "Bạc", "Vàng"
  point_goal: number; // Số điểm cần đạt để lên hạng này
  color_hex: string; // Mã màu để hiển thị (ví dụ: #cd7f32)
  benefits_description: string; // Mô tả quyền lợi
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LoyaltySettings {
  points_per_vnd: number; // Tỷ lệ quy đổi: ? VNĐ = 1 điểm
  tiers: LoyaltyTier[];
}
