// src/features/resources/types.ts

// Đại diện cho một không gian vật lý có thể chứa các tài nguyên khác
export interface Room {
  id: string;
  name: string; // Ví dụ: "Phòng VIP 1", "Phòng Sauna"
  description?: string;
}

// Luôn là tài nguyên cố định, thuộc về một phòng
export interface Bed {
  id: string;
  name: string; // Ví dụ: "Giường G01"
  room_id: string; // Khóa ngoại liên kết với Room
}

export type EquipmentType = "FIXED" | "MOBILE";

// Đại diện cho một loại thiết bị, không phải một thiết bị cụ thể
export interface Equipment {
  id: string;
  name: string; // Ví dụ: "Máy phân tích da", "Máy điện di"
  type: EquipmentType;
  quantity: number; // Tổng số lượng (chỉ quan trọng với thiết bị di động)
  // Với thiết bị cố định, sẽ có liên kết tới phòng
  room_id?: string | null;
}
