## ⚙️ Hướng Dẫn Toàn Diện Cho AI: Clean Code, React/Next.js & Comment Tiếng Việt

**Mục tiêu cốt lõi:** Luôn tạo ra code **sạch (Clean Code)**, tuân thủ nghiêm ngặt các quy ước của dự án React/Next.js này, và sử dụng **tiếng Việt** để comment code một cách ngắn gọn, rõ ràng, và có ý nghĩa.

---

## I. Nguyên Tắc Clean Code Bắt Buộc (Áp dụng chung)

| Quy Tắc | Mô Tả Yêu Cầu Chi Tiết |
| :--- | :--- |
| **Tên Rõ Ràng & Có Ý Nghĩa** | Tên biến, hàm, component, hook phải **mô tả rõ ràng** mục đích của chúng. (Ví dụ: `calculateOrderTotal` thay vì `tinhTong`, `ProductCard` thay vì `PCard`). |
| **Hàm/Component Ngắn Gọn** | Mỗi hàm và component React phải **ngắn nhất có thể** và chỉ làm **một việc duy nhất** (Single Responsibility Principle - SRP). Component phức tạp nên được chia thành các component con. |
| **Tránh Lặp Lại (DRY)** | Không lặp lại cùng một đoạn logic (Don't Repeat Yourself). Tái sử dụng code bằng cách tạo các **component, hook, hoặc hàm tiện ích (`utils`) chung**. |
| **Xử Lý Lỗi Rõ Ràng** | Sử dụng các cơ chế xử lý lỗi của React Query (`isError`, `error`) và React (Error Boundaries) để xử lý lỗi một cách tường minh. Tránh trả về `null` hoặc `undefined` một cách ngầm định khi có thể gây lỗi. |
| **Định Dạng Nhất Quán** | Luôn áp dụng phong cách định dạng (dấu cách, thụt đầu dòng, dấu ngoặc) một cách nhất quán. Chạy `eslint --fix` trước khi commit. |

---

## II. Quy Tắc Cụ Thể cho Dự án (React, Next.js, TypeScript)

Khi viết code cho dự án này, **BẮT BUỘC** tuân thủ các quy tắc sau:

1.  **Cấu Trúc Thư Mục:**
    *   Luôn tuân thủ cấu trúc thư mục theo tính năng đã có: `src/features/[feature-name]/`.
    *   Bên trong mỗi feature, phân chia rõ ràng thành `api`, `components`, `hooks`, `schemas`, `types`.

2.  **Quy Ước Đặt Tên:**
    *   **`PascalCase`** cho tên Component và kiểu dữ liệu TypeScript (type/interface). Ví dụ: `ProductCard`, `interface UserProfile`.
    *   **`camelCase`** cho biến, hàm, và custom hooks. Ví dụ: `useProducts`, `calculateTotal`.

3.  **TypeScript & An Toàn Kiểu:**
    *   Tận dụng tối đa TypeScript. **Không sử dụng kiểu `any`**.
    *   Tất cả các kiểu dữ liệu (types) cho API response và các đối tượng dữ liệu phức tạp phải được định nghĩa trong file `types.ts` của feature tương ứng.
    *   Sử dụng các kiểu tiện ích của TypeScript (Utility Types) khi cần thiết (`Pick`, `Omit`, `Partial`, v.v.).

4.  **Quản Lý Trạng Thái (State Management):**
    *   **Server State (Dữ liệu từ API):** **BẮT BUỘC** sử dụng **React Query (TanStack Query)**.
        *   Logic fetch và mutate dữ liệu phải được đóng gói trong các custom hooks trong thư mục `features/[feature-name]/hooks/`. Ví dụ: `useProducts`, `useUpdateService`.
    *   **Client State (Trạng thái phía giao diện):**
        *   Sử dụng **Zustand** cho các trạng thái phức tạp, được chia sẻ giữa nhiều component (ví dụ: giỏ hàng, trạng thái POS).
        *   Sử dụng `useState` hoặc `useReducer` của React cho các trạng thái đơn giản, cục bộ trong một component.

5.  **Styling:**
    *   **BẮT BUỘC** sử dụng **Tailwind CSS** và tiện ích `cn()` từ `@/lib/utils` để kết hợp các class.
    *   **TRÁNH** sử dụng inline styles (`style={{ ... }}`) trừ khi thuộc tính đó là động và không thể áp dụng bằng class của Tailwind (ví dụ: `transform`, màu sắc động từ API).

6.  **Imports:**
    *   Mỗi `import` trên một dòng riêng.
    *   **Không** sử dụng import đại diện (wildcard `*`), trừ khi cho file `index.ts` của một module.
    *   Sắp xếp import theo thứ tự: React, Next.js -> Thư viện ngoài -> Alias nội bộ (`@/`) -> Import tương đối (`../`).

---

## III. Quy Tắc Comment (Sử Dụng Tiếng Việt)

| Loại Comment | Yêu Cầu Thực Hiện Bằng Tiếng Việt | Ghi Chú |
| :--- | :--- | :--- |
| **JSDoc** | Bắt buộc mô tả **Chức năng chính**, **Tham số (`@param`)** cho props, và **Giá trị trả về (`@returns`)** của các component và custom hook phức tạp. | Sử dụng cú pháp JSDoc `/** ... */` và Tiếng Việt chuẩn. |
| **Giải Thích Logic** | Chỉ comment những đoạn code có **logic phức tạp** (ví dụ: thuật toán tính toán phức tạp, `useMemo` hoặc `useEffect` có logic khó hiểu) hoặc **cần giải thích LÝ DO** cho quyết định thiết kế. | **Hạn chế** comment code đã rõ ràng. |
| **Định Dạng** | Comment phải **ngắn gọn**, **súc tích**, và **nằm trên dòng riêng** ngay trước dòng code mà nó giải thích. | Sử dụng `//` cho comment một dòng và `/* ... */` cho comment nhiều dòng. |
| **Ghi Chú Công Việc** | Sử dụng **`// TODO:`** hoặc **`// FIXME:`** để đánh dấu những việc cần làm hoặc cần sửa lỗi sau này. | Giữ nguyên từ khóa tiếng Anh (`TODO`, `FIXME`). |

---

## 🚀 Tóm Tắt & Ưu Tiên

1.  **Code phải tự giải thích trước.** Tên biến/hàm/component rõ ràng là ưu tiên hàng đầu.
2.  **Tuân thủ kiến trúc đã định sẵn.** Logic phải được đặt đúng chỗ (component, hook, api, schema).
3.  **Sử dụng đúng công cụ quản lý state.** Phân biệt rõ ràng giữa Server State, Global Client State và Local Component State.
4.  **Tất cả comment phải ngắn gọn và rõ ràng bằng TIẾNG VIỆT.**