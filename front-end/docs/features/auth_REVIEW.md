# Đánh giá Code Feature: Xác thực (Authentication)

## 1. Tổng quan

Nhìn chung, feature `auth` được xây dựng tốt, tuân thủ các quy ước của dự án và sử dụng các thư viện một cách hợp lý. Cấu trúc thư mục rõ ràng, code có khả năng đọc và bảo trì.

**Điểm mạnh:**

*   **Cấu trúc tốt:** Code được tổ chức logic theo đúng cấu trúc `features` của dự án.
*   **Quản lý State hiệu quả:** Sử dụng `React Query` cho server state (`useChangePassword`) và `Context API` (`AuthProvider`) cho global client state là một cách tiếp cận tốt.
*   **Validation mạnh mẽ:** Tận dụng `Zod` và `React Hook Form` để xác thực form một cách nhất quán.
*   **Trải nghiệm người dùng:** Các form có xử lý trạng thái loading, success, error rõ ràng, cung cấp phản hồi tốt cho người dùng.

## 2. Phát hiện & Đề xuất Cải thiện

### 2.1. Vấn đề Logic & Kiến trúc

| File | Vấn đề | Đề xuất | Mức độ ưu tiên |
| :--- | :--- | :--- | :--- |
| `features/auth/contexts/AuthContexts.tsx` | **Hard reload sau khi login/logout:** Hàm `login` gọi `window.location.reload()` và hàm `logout` gán `window.location.href`. Điều này làm gián đoạn trải nghiệm người dùng (SPA) và không cần thiết. | Sử dụng `router.push()` của Next.js để điều hướng. Sau khi login thành công, thay vì reload, hãy gọi lại `fetchProfile` để cập nhật `user` state, React sẽ tự động render lại UI. | **Cao** |
| `features/auth/contexts/AuthContexts.tsx` | **Fetch profile trong `useEffect`:** Việc fetch thông tin người dùng trong `useEffect` sẽ được thực thi mỗi khi `AuthProvider` được mount, có thể dẫn đến việc gọi API không cần thiết khi chuyển trang. | Chuyển logic `fetchProfile` vào một custom hook `useUser` sử dụng `useQuery` của React Query. Cấu hình `staleTime: Infinity` để chỉ fetch một lần và lấy dữ liệu từ cache trong suốt phiên làm việc. | **Trung bình** |
| `features/auth/apis/auth_api.ts` | **Sự không nhất quán của `apiClient`:** Một số hàm (`login`, `fetchProfile`) đang dùng `fetch` trực tiếp, trong khi các hàm khác trong dự án (`changePassword`, `register`) lại dùng `apiClient`. | Thống nhất sử dụng `apiClient` cho tất cả các lệnh gọi API. Điều này giúp tập trung logic xử lý lỗi, interceptor và header vào một nơi duy nhất. | **Trung bình** |
| `features/auth/components/forgot-password-form.tsx` | **Logic `onSubmit` bị comment:** Hàm `forgotPassword` trong form quên mật khẩu đang bị comment lại, khiến tính năng không hoạt động. | Implement logic gọi API `forgotPassword` đã được định nghĩa trong `password.api.ts` và đưa vào hook `useForgotPassword` để quản lý mutation. | **Cao** |

### 2.2. Tái cấu trúc & Hiệu suất

| File | Vấn đề | Đề xuất | Mức độ ưu tiên |
| :--- | :--- | :--- | :--- |
| `features/auth/schemas.ts` | **Lặp lại logic validation mật khẩu:** `resetPasswordFormSchema` và `changePasswordSchema` đều định nghĩa lại logic kiểm tra độ dài và ký tự của mật khẩu. | Tạo một `passwordSchema` chung có thể tái sử dụng trong `lib/schemas.ts` và import vào các schema khác. Điều này tuân thủ nguyên tắc DRY. | **Thấp** |
| `features/auth/apis/auth_api.ts` | **Hàm `safeRequest` chưa hiệu quả:** Hàm này chỉ `console.warn` và không ném lỗi, khiến phía gọi không biết được request có thật sự thất bại hay không. | Sửa đổi `safeRequest` để nó `throw new Error` hoặc trả về một object có cấu trúc `{ success: boolean, error?: Error }` để bên gọi có thể xử lý. Tuy nhiên, khi đã thống nhất dùng `apiClient`, hàm này có thể không còn cần thiết. | **Thấp** |
| `features/auth/components/login-form.tsx`, `register-form.tsx`, `reset-password-form.tsx` | **Lặp lại UI cho việc hiển thị/ẩn mật khẩu:** Logic và icon cho việc `show/hide password` được lặp lại ở nhiều form. | Tạo một component `PasswordInput` chung (nếu chưa có) hoặc đưa logic này vào `Input` component hiện tại để có thể tái sử dụng. Component `PasswordInput` trong `common` đã có nhưng chưa xử lý logic này. | **Thấp** |

### 2.3. Phong cách Code & Chất lượng

| File | Vấn đề | Đề xuất | Mức độ ưu tiên |
| :--- | :--- | :--- | :--- |
| `features/auth/apis/auth_api.ts` | **Comment không nhất quán:** Comment trong hàm `login` (`// Không cần return response.json() nữa...`) mâu thuẫn với việc code vẫn `return response.json()`. | Xóa bỏ comment hoặc chỉnh sửa code để đồng bộ với comment. Nếu token được xử lý hoàn toàn qua httpOnly cookie, hàm `login` nên trả về `Promise<void>`. | **Thấp** |

## 3. Kết luận

Feature `auth` có nền tảng tốt. Các đề xuất trên tập trung vào việc cải thiện trải nghiệm người dùng (loại bỏ hard reload), tăng tính nhất quán và khả năng tái sử dụng code. Ưu tiên hàng đầu là sửa lại luồng xử lý sau khi `login` và `logout` và implement đầy đủ tính năng "quên mật khẩu".