# Tóm Tắt Sản Phẩm Chi Tiết: Hệ Thống Chăm Sóc Khách Hàng Cho Spa

## 1. Tổng quan / Mô tả Dự án

Dự án này nhằm xây dựng một nền tảng web toàn diện (all-in-one) để số hóa và tối ưu hóa hoạt động của một spa. Hệ thống cung cấp hai giao diện chính: một trang web công khai cho khách hàng và một trang quản trị nội bộ cho nhân viên và quản lý. Mục tiêu là nâng cao trải nghiệm của khách hàng, tự động hóa quy trình đặt lịch, và đơn giản hóa việc quản lý vận hành hàng ngày của spa.

## 2. Đối tượng Mục tiêu

*   **Khách hàng:** Người dùng cuối muốn tìm hiểu thông tin, mua sản phẩm/dịch vụ và đặt lịch hẹn trực tuyến một cách thuận tiện.
*   **Nhân viên Spa (Kỹ thuật viên):** Nhân viên thực hiện dịch vụ, quản lý lịch làm việc cá nhân và theo dõi các lịch hẹn được phân công.
*   **Quản trị viên / Chủ Spa:** Người quản lý toàn bộ hệ thống, bao gồm cấu hình dịch vụ, sản phẩm, quản lý nhân sự, khách hàng, tồn kho và theo dõi các chỉ số kinh doanh.

## 3. Kịch Bản Người Dùng & Tính Năng Chính (User Stories & Features)

### 3.1. Dành cho Khách hàng (Public)

*   **Duyệt và tìm kiếm:**
    *   **Là một khách hàng tiềm năng,** tôi muốn dễ dàng xem danh sách các dịch vụ và sản phẩm mà spa cung cấp để tôi có thể quyết định lựa chọn.
    *   **Là một khách hàng,** tôi muốn tìm kiếm một dịch vụ cụ thể (ví dụ: "chăm sóc da mặt") để xem chi tiết và giá cả.
*   **Đặt lịch hẹn trực tuyến:**
    *   **Là một khách hàng bận rộn,** tôi muốn xem lịch trống của các kỹ thuật viên và tự đặt lịch hẹn vào một khung giờ phù hợp mà không cần gọi điện.
    *   **Là một khách hàng,** tôi muốn nhận được email hoặc thông báo xác nhận sau khi đặt lịch thành công và lời nhắc trước ngày hẹn.
*   **Thanh toán và Quản lý tài khoản:**
    *   **Là một khách hàng,** tôi muốn thêm nhiều sản phẩm và dịch vụ vào giỏ hàng và thanh toán tất cả cùng một lúc qua cổng thanh toán trực tuyến.
    *   **Là một khách hàng thân thiết,** tôi muốn đăng nhập vào tài khoản của mình để xem lại lịch sử các buổi hẹn, các sản phẩm đã mua và kiểm tra số điểm thành viên tích lũy.

### 3.2. Dành cho Quản trị viên & Nhân viên (Admin Dashboard)

*   **Bán hàng tại quầy (POS):**
    *   **Là một nhân viên lễ tân,** tôi muốn nhanh chóng tạo một hóa đơn cho khách hàng vãng lai, thêm dịch vụ và sản phẩm, sau đó xử lý thanh toán bằng tiền mặt hoặc thẻ.
    *   **Là một quản lý,** tôi muốn có thể ghi nhận công nợ cho một khách hàng thân thiết để họ có thể thanh toán sau.
*   **Quản lý Lịch hẹn:**
    *   **Là một nhân viên lễ tân,** tôi muốn xem toàn bộ lịch hẹn của spa trong một giao diện lịch trực quan (theo ngày/tuần/tháng) để điều phối công việc.
    *   **Là một kỹ thuật viên,** tôi muốn chỉ xem các lịch hẹn được gán cho tôi trong ngày hôm nay để chuẩn bị phục vụ khách hàng.
*   **Quản lý Danh mục:**
    *   **Là một quản lý,** tôi muốn dễ dàng thêm một dịch vụ mới, tải lên hình ảnh, mô tả, đặt giá và chỉ định những kỹ thuật viên nào có thể thực hiện dịch vụ đó.
    *   **Là một quản lý,** tôi muốn tạo một chương trình khuyến mãi "Giảm 20% cho tất cả sản phẩm chăm sóc tóc" và áp dụng nó trong một khoảng thời gian nhất định.
*   **Quản lý Khách hàng (CRM):**
    *   **Là một quản lý,** tôi muốn xem hồ sơ chi tiết của một khách hàng, bao gồm thông tin liên hệ, lịch sử giao dịch, các ghi chú riêng và công nợ hiện tại.
*   **Quản lý Nhân sự:**
    *   **Là một chủ spa,** tôi muốn thêm một nhân viên mới vào hệ thống và gán cho họ vai trò "Kỹ thuật viên" để giới hạn quyền truy cập của họ chỉ trong các chức năng cần thiết.
*   **Quản lý Kho:**
    *   **Là một quản lý,** tôi muốn hệ thống tự động trừ số lượng sản phẩm trong kho khi một đơn hàng được bán ra và nhận được cảnh báo khi một sản phẩm sắp hết hàng.

## 4. Yêu cầu Phi chức năng (Non-Functional Requirements)

*   **Hiệu suất:**
    *   Thời gian tải trang lần đầu (First Contentful Paint) cho trang chủ và các trang dịch vụ phải dưới 2 giây.
    *   Hệ thống phải phản hồi các tương tác của người dùng (ví dụ: thêm vào giỏ hàng, lọc sản phẩm) trong vòng 200ms.
*   **Khả năng truy cập (Accessibility):**
    *   Hệ thống phải tuân thủ các tiêu chuẩn WCAG 2.1 cấp độ AA, đảm bảo người dùng khuyết tật có thể sử dụng được.
    *   Tất cả các chức năng phải có thể truy cập được bằng bàn phím.
*   **Bảo mật:**
    *   Mật khẩu người dùng phải được băm (hashed) và muối (salted).
    *   Hệ thống phải được bảo vệ khỏi các lỗ hổng phổ biến như XSS và CSRF.
    *   Phân quyền dựa trên vai trò (RBAC) phải được thực thi nghiêm ngặt ở cả front-end và back-end.
*   **Khả năng tương thích:**
    *   Trang web công khai phải hiển thị tốt trên các trình duyệt hiện đại (Chrome, Firefox, Safari, Edge) và trên các thiết bị di động (responsive design).

## 5. Công nghệ & Kiến trúc

Nền tảng front-end được xây dựng dựa trên các công nghệ và quy ước hiện đại để đảm bảo hiệu suất, khả năng bảo trì và mở rộng:

*   **Framework:** Next.js (với App Router)
*   **Ngôn ngữ:** TypeScript
*   **Styling:** Tailwind CSS và shadcn/ui
*   **Quản lý Trạng thái (State Management):**
    *   **Server State:** React Query (TanStack Query) để fetch, cache và cập nhật dữ liệu từ server.
    *   **Client State:** Zustand để quản lý các trạng thái phức tạp phía client (ví dụ: giỏ hàng POS).
*   **Form:** React Hook Form kết hợp với Zod để xác thực schema.
*   **Kiến trúc:** Tổ chức code theo từng "feature" (tính năng), giúp dễ dàng quản lý và phát triển.