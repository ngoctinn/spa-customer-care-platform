# LẬP KẾ HOẠCH YÊU CẦU KỸ THUẬT (TECHNICAL PLAN)

## NHIỆM VỤ

Tạo tài liệu yêu cầu KỸ THUẬT (Technical Requirements Document) TỪ mô tả tính năng của người dùng, phù hợp với kiến trúc dự án Next.js/React.

## YÊU CẦU BẮT BUỘC (CONSTRAINTS)

1. Cực kỳ SÚC TÍCH, CHÍNH XÁC và chỉ tập trung vào yếu tố kỹ thuật.
2. **NGHIÊM CẤM:** Thêm các phần Quản lý Dự án (ví dụ: Timeline, Success Criteria, v.v.).
3. **NGHIÊM CẤM:** Viết bất kỳ code thực tế nào.
4. Viết kế hoạch vào một tệp `docs/features/<N>_PLAN.md` với số tính năng có sẵn tiếp theo (bắt đầu bằng 0001).

## CẤU TRÚC ĐẦU RA

Tài liệu phải bao gồm:

1.  **Mô tả Ngữ cảnh:** Tóm tắt ngắn gọn tính năng.
2.  **Các Tệp và Hàm Liên quan:** Chỉ ra rõ ràng các tệp cần THAY ĐỔI hoặc TẠO MỚI. Phải tuân thủ cấu trúc `src/features/[feature-name]/` của dự án. Ví dụ:
    *   **TẠO MỚI:** `src/features/new-feature/hooks/useNewFeature.ts`
    *   **TẠO MỚI:** `src/features/new-feature/components/NewComponent.tsx`
    *   **CẬP NHẬT:** `src/features/existing-feature/api/existingApi.ts`
3.  **Thuật toán/Logic (Từng bước):** Giải thích chi tiết, từng bước (step-by-step) về bất kỳ thuật toán hoặc luồng logic phức tạp nào. Đối với các tính năng UI, mô tả luồng tương tác của người dùng.
4.  **Cấu trúc Dữ liệu & State:** Mô tả các thay đổi cần thiết cho `types.ts`, `schemas.ts` (Zod), hoặc state của Zustand (nếu có).