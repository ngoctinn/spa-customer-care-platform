# Đánh Giá Code Toàn Diện - Front-end (Tháng 10/2025)

## NGỮ CẢNH

Đây là bản đánh giá kỹ thuật tự động cho toàn bộ codebase front-end của dự án "Hệ thống chăm sóc khách hàng cho Spa", dựa trên các tệp mã nguồn trong thư mục `src`. Đánh giá này tuân thủ các yêu cầu trong file `.github/prompts/code_review.prompt.md`.

## ĐÁNH GIÁ TỔNG QUAN

Codebase front-end thể hiện chất lượng rất cao và một kiến trúc vững chắc. Các quy ước của dự án được áp dụng một cách nhất quán, đặc biệt là cấu trúc thư mục theo `features`, việc sử dụng React Query cho server state, và việc xây dựng các component có khả năng tái sử dụng cao. Các vấn đề được xác định chủ yếu là các cơ hội để tinh chỉnh và tái cấu trúc nhằm cải thiện hơn nữa khả năng bảo trì, thay vì các lỗi kiến trúc nghiêm trọng.

**Điểm mạnh nổi bật:**

- **Kiến trúc nhất quán:** Việc áp dụng `ResourcePageLayout` và hook `useResourceManagement` trên nhiều trang quản lý (Sản phẩm, Dịch vụ, Liệu trình, v.v.) giúp giảm đáng kể mã lặp lại và chuẩn hóa giao diện người dùng.
- **Quản lý State rõ ràng:** Phân tách rõ ràng giữa Server State (React Query) và Client State (Zustand/useState) là một điểm cộng lớn, giúp ứng dụng dễ dự đoán và gỡ lỗi hơn.
- **Cấu trúc thư mục có tổ chức:** Việc nhóm code theo tính năng (`features`) giúp việc định vị và phát triển các chức năng mới trở nên cực kỳ hiệu quả.

---

## PHÂN TÍCH CHI TIẾT

### 1. Lỗi và Vấn đề Logic

- **Vấn đề:** Logic chưa hoàn thiện trong form ghi đè lịch.
  - **Vị trí:** `src/features/work-schedules/components/ScheduleOverrideForm.tsx`
  - **Phân tích:** Hàm `createScheduleOverride` trong mutation đang được comment lại và thay thế bằng `console.log`. Điều này cho thấy tính năng chưa được kết nối hoàn chỉnh với backend.
  - **Đề xuất:** Hoàn thiện việc gọi API `createScheduleOverride` và xử lý các trạng thái pending/error một cách đầy đủ.

### 2. Kiến trúc & Quy ước Dự án

- **Vấn đề:** Logic fetch dữ liệu được định nghĩa ngay trong component.
  - **Vị trí:**
    - `src/app/(admin)/dashboard/customers/[customerId]/page.tsx` (để lấy `debtHistory`)
    - `src/app/(admin)/dashboard/inventory/suppliers/[supplierId]/page.tsx` (để lấy `warehouseSlips`)
  - **Phân tích:** Các trang này sử dụng `useQuery` với một hàm `queryFn` được định nghĩa inline để gọi `apiClient`. Mặc dù hoạt động, điều này phá vỡ quy ước của dự án là đóng gói tất cả các lệnh gọi API và logic React Query vào các custom hook trong thư mục `features/[feature]/hooks`.
  - **Đề xuất:** Tạo các hook chuyên dụng mới (ví dụ: `useDebtHistory(customerId)` trong `features/customer/hooks/` và `useWarehouseSlipsBySupplier(supplierId)` trong `features/inventory/hooks/`) để đóng gói logic này, giúp tăng tính tái sử dụng và nhất quán.

### 3. Tái cấu trúc và Hiệu suất

- **Vấn đề:** Component quá lớn và phức tạp.
  - **Vị trí:**
    - `src/app/(admin)/dashboard/appointments/page.tsx` (~300 dòng)
    - `src/app/(admin)/dashboard/my-schedule/page.tsx` (~300 dòng)
    - `src/app/(public)/booking/page.tsx` (~200 dòng)
  - **Phân tích:** Các component này đang quản lý quá nhiều state cục bộ, logic nghiệp vụ phức tạp, và các `useEffect` hoặc `useMemo` khó theo dõi. Ví dụ, `AppointmentsPage` định nghĩa một `mockTable` để dùng cho bộ lọc, hay `MySchedulePage` có logic validation phức tạp trong `useEffect`.
  - **Đề xuất:**
    - **`AppointmentsPage`:** Tách logic quản lý bộ lọc (filters, mockTable) ra một custom hook riêng (`useAppointmentFilters`).
    - **`MySchedulePage`:** Tái cấu trúc thành các component con nhỏ hơn (ví dụ: `CheckInPanel`, `ScheduleRegistrationForm`). Logic validation nên được tích hợp vào schema của Zod nếu có thể, hoặc đóng gói trong một hook riêng.
    - **`BookingPage`:** Xem xét tạo một state machine (ví dụ: với XState hoặc Zustand) để quản lý các bước của quy trình đặt lịch thay vì dùng `useState` cho `step`.

### 4. Phong cách Code & Chất lượng

- **Vấn đề:** Sử dụng `any` hoặc `@ts-ignore`.
  - **Vị trí:**
    - `src/features/checkout/api/invoice.api.ts`: Có một `@ts-ignore` trong hàm `createOrder` liên quan đến `prepaid_card_code`.
    - `src/app/(admin)/dashboard/appointments/page.tsx`: Prop `column` của `DataTableFacetedFilter` bị ép kiểu `as any`.
    - `src/features/checkout/components/pos/DebtPaymentForm.tsx`: Prop `content` của `useReactToPrint` bị ép kiểu `as any`.
  - **Phân tích:** Việc sử dụng `any` hoặc `ts-ignore` làm giảm độ an toàn về kiểu và đi ngược lại với nguyên tắc của TypeScript.
  - **Đề xuất:**
    - **`invoice.api.ts`:** Mở rộng kiểu `CreateOrderPayload` để bao gồm `prepaid_card_code` một cách tùy chọn.
    - **`AppointmentsPage`:** `DataTableFacetedFilter` nên được cập nhật để chấp nhận kiểu `Column` một cách an toàn, có thể cần điều chỉnh định nghĩa `mockTable`.
    - **`DebtPaymentForm`:** Cập nhật kiểu cho `receiptRef` để `useReactToPrint` chấp nhận mà không cần `ts-ignore`.

## KẾT LUẬN

Codebase có nền tảng rất tốt và đang đi đúng hướng. Các vấn đề được nêu trên không phải là lỗi nghiêm trọng mà là những cơ hội để cải tiến, giúp dự án trở nên "sạch" hơn, dễ bảo trì và mở rộng hơn nữa. Ưu tiên hàng đầu nên là việc tái cấu trúc các component lớn và loại bỏ hoàn toàn việc sử dụng `any` và `@ts-ignore`.
