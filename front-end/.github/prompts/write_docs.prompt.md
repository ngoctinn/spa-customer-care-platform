# VIẾT/CẬP NHẬT TÀI LIỆU TÍNH NĂNG (FEATURE DOCUMENTATION)

## NHIỆM VỤ

Viết hoặc cập nhật tài liệu cho tính năng front-end vừa triển khai. CODE là nguồn sự thật duy nhất (Source of Truth); Plan và Review chỉ được dùng để tham khảo ngữ cảnh.

## QUY TẮC CƠ BẢN

1.  Phải khớp với phong cách, định dạng, và cấu trúc tài liệu hiện có của dự án.
2.  **KHÔNG BAO GIỜ** tạo tệp tài liệu mới trong thư mục chứa Plan/Review.
3.  Tránh dư thừa thông tin trừ khi điều đó làm tăng khả năng sử dụng.

## KHU VỰC CẦN CẬP NHẬT

Cập nhật hoặc thêm tài liệu vào các khu vực sau:

1.  **Tài liệu Nhập môn (`README.md`):** Nếu tính năng mới thay đổi cách cài đặt, chạy dự án, hoặc thêm biến môi trường mới, hãy cập nhật `README.md`.
2.  **Comment Code (JSDoc):**
    *   Thêm JSDoc cho các **component** mới hoặc được sửa đổi, giải thích rõ mục đích và các `props` quan trọng.
    *   Thêm JSDoc cho các **custom hook** mới, giải thích chức năng và giá trị trả về.
    *   Chỉ thêm comment nội tuyến (`//` hoặc `/* */`) khi logic bên trong một hàm thực sự phức tạp và khó hiểu.
3.  **Tài liệu Storybook (Nếu có):** Nếu dự án sử dụng Storybook, cập nhật hoặc tạo các stories cho các component mới/đã sửa đổi để minh họa các trạng thái khác nhau của chúng.