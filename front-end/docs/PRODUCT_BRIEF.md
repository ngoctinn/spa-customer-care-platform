# Tóm Tắt Sản Phẩm: Hệ Thống Chăm Sóc Khách Hàng Cho Spa

## 1. Tổng quan / Mô tả Dự án

Dự án này nhằm xây dựng một nền tảng web toàn diện (all-in-one) để số hóa và tối ưu hóa hoạt động của một spa. Hệ thống cung cấp hai giao diện chính: một trang web công khai cho khách hàng và một trang quản trị nội bộ cho nhân viên và quản lý. Mục tiêu là nâng cao trải nghiệm của khách hàng, tự động hóa quy trình đặt lịch, và đơn giản hóa việc quản lý vận hành hàng ngày của spa.

## 2. Đối tượng Mục tiêu

*   **Khách hàng:** Người dùng cuối muốn tìm hiểu thông tin, mua sản phẩm/dịch vụ và đặt lịch hẹn trực tuyến một cách thuận tiện.
*   **Nhân viên Spa (Kỹ thuật viên):** Nhân viên thực hiện dịch vụ, quản lý lịch làm việc cá nhân và theo dõi các lịch hẹn được phân công.
*   **Quản trị viên / Chủ Spa:** Người quản lý toàn bộ hệ thống, bao gồm cấu hình dịch vụ, sản phẩm, quản lý nhân sự, khách hàng, tồn kho và theo dõi các chỉ số kinh doanh.

## 3. Lợi ích / Tính năng Chính

*   **Phía Khách hàng (Public):**
    *   Duyệt và tìm kiếm dịch vụ, sản phẩm, và các gói liệu trình.
    *   Hệ thống đặt lịch hẹn trực tuyến thông minh, cho phép chọn dịch vụ, kỹ thuật viên và khung giờ trống.
    *   Giỏ hàng và quy trình thanh toán cho sản phẩm và dịch vụ mua trước.
    *   Trang tài khoản cá nhân để quản lý thông tin, xem lại lịch sử đặt hẹn, lịch sử mua hàng và điểm thành viên.

*   **Phía Quản trị (Admin Dashboard):**
    *   **Bán hàng tại quầy (POS):** Tạo đơn hàng và xử lý thanh toán trực tiếp tại spa, bao gồm cả thanh toán công nợ.
    *   **Quản lý Lịch hẹn:** Giao diện lịch trực quan để xem, tạo và quản lý tất cả lịch hẹn.
    *   **Quản lý Danh mục:** Quản lý toàn diện các dịch vụ, sản phẩm, liệu trình, và chương trình khuyến mãi.
    *   **Quản lý Khách hàng:** Xem danh sách, thông tin chi tiết, lịch sử và quản lý điểm thành viên, công nợ.
    *   **Quản lý Nhân sự:** Thêm mới nhân viên, phân quyền theo vai trò, và thiết lập lịch làm việc.
    *   **Quản lý Kho:** Theo dõi tồn kho, quản lý nhà cung cấp, tạo phiếu nhập/xuất và thực hiện kiểm kê.

## 4. Công nghệ & Kiến trúc

Nền tảng front-end được xây dựng dựa trên các công nghệ và quy ước hiện đại để đảm bảo hiệu suất, khả năng bảo trì và mở rộng:

*   **Framework:** Next.js (với App Router)
*   **Ngôn ngữ:** TypeScript
*   **Styling:** Tailwind CSS và shadcn/ui
*   **Quản lý Trạng thái (State Management):**
    *   **Server State:** React Query (TanStack Query) để fetch, cache và cập nhật dữ liệu từ server.
    *   **Client State:** Zustand để quản lý các trạng thái phức tạp phía client (ví dụ: giỏ hàng POS).
*   **Form:** React Hook Form kết hợp với Zod để xác thực schema.
*   **Kiến trúc:** Tổ chức code theo từng "feature" (tính năng), giúp dễ dàng quản lý và phát triển.
