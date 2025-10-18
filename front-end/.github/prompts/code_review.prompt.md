# ĐÁNH GIÁ CODE KỸ THUẬT (FRONT-END CODE REVIEW)

## NGỮ CẢNH

Giả định tính năng đã được triển khai xong (code) và có kế hoạch kỹ thuật (`@PLAN.md`) đính kèm.

## NHIỆM VỤ

Thực hiện đánh giá code toàn diện cho dự án Next.js/React. Lưu tài liệu về các phát hiện vào duy nhất 1 file `docs/features/<N>_REVIEW.md`.

## YÊU CẦU KIỂM TRA CHUYÊN SÂU

1.  **Triển khai Kế hoạch:** Đảm bảo rằng kế hoạch kỹ thuật đã được triển khai CHÍNH XÁC.
2.  **Lỗi và Vấn đề Logic:** Tìm kiếm bất kỳ lỗi (bug) hoặc vấn đề rõ ràng nào trong logic của component, hook, hoặc hàm.
3.  **Kiến trúc & Quy ước Dự án:**
    *   **Cấu trúc file:** Code mới có tuân thủ cấu trúc `src/features/[feature-name]` không? Các file `api.ts`, `components`, `hooks.ts`, `schemas.ts`, `types.ts` có được sử dụng đúng mục đích không?
    *   **Quản lý State:** Dữ liệu từ server có được fetch bằng React Query thông qua custom hook không? State phía client có được quản lý hợp lý bằng `Zustand` (cho global state) hoặc `useState` (cho local state) không?
4.  **Tái cấu trúc và Hiệu suất:**
    *   **Component Quá Lớn:** Tìm các component React quá lớn (trên 300 dòng) hoặc làm quá nhiều việc. Đề xuất chia nhỏ thành các component con.
    *   **Tái sử dụng:** Logic có thể được trừu tượng hóa thành một custom hook (`use...`) hoặc một component chung không?
    *   **Hiệu suất Render:** Tìm kiếm các vấn đề về hiệu suất render không cần thiết. `useMemo` và `useCallback` có được sử dụng đúng chỗ không?
5.  **Phong cách Code & Chất lượng:**
    *   **Typing:** Code có an toàn về kiểu không? Có sử dụng kiểu `any` không cần thiết không?
    *   **Styling:** Có tuân thủ việc sử dụng Tailwind CSS và tiện ích `cn()` không? Có tồn tại inline style không cần thiết không?
    *   **Khả năng tiếp cận (Accessibility):** Các yếu tố tương tác có đảm bảo các thuộc tính ARIA và ngữ nghĩa HTML phù hợp không?