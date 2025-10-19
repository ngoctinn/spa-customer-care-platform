## **Quy Trình Làm Việc Với Gemini Terminal Cho Dự Án Spa-Customer-Care-Platform**

### **Bước 1: Thiết lập Ngữ cảnh (Project & Context Setup)**

**Mục đích:** "Dạy" cho Gemini về các quy tắc, kiến trúc và mục tiêu nghiệp vụ của dự án. **Chỉ cần làm một lần khi bắt đầu một chat session mới.**

#### **A. Cung cấp Bối cảnh và Quy tắc của Dự án**

**Lệnh/Prompt Chi tiết:**

```
Sử dụng các file sau đây làm ngữ cảnh cốt lõi cho mọi yêu cầu tiếp theo trong cuộc trò chuyện này: @front-end/.github/instructions/instructions.md Đây là file hướng dẫn Clean Code, React/Next.js và quy tắc comment tiếng Việt. BẮT BUỘC tuân thủ 100% các quy tắc trong file này. @front-end/docs/PRODUCT_BRIEF.md Đây là bản tóm tắt sản phẩm, mô tả mục tiêu và đối tượng người dùng. __ Đây là bản đánh giá toàn bộ codebase, giúp bạn hiểu các điểm mạnh và yếu của kiến trúc hiện tại.
```

**Hướng dẫn sử dụng:**

- **Khi nào dùng:** Luôn bắt đầu một phiên làm việc mới (chat mới) bằng lệnh này.
- **Tại sao:** Lệnh này nạp những thông tin quan trọng nhất vào bộ nhớ của Gemini:
  - `instructions.md` đảm bảo code được tạo ra luôn sạch, đúng quy ước (React Query, Zustand, Tailwind) và có comment tiếng Việt.
  - `PRODUCT_BRIEF.md` cung cấp ngữ cảnh nghiệp vụ, giúp Gemini hiểu "tại sao" chúng ta lại xây dựng tính năng này.
  - `SYSTEM_CODE_REVIEW.md` giúp Gemini học hỏi từ những nhận xét trước đó và tránh lặp lại các lỗi kiến trúc.

---

### **Bước 2: Phát triển Tính năng (Feature Development)**

Đây là chu trình chính để xây dựng một tính năng mới từ đầu đến cuối.

#### **A. Lập kế hoạch Kỹ thuật cho Tính năng Mới (Quan trọng nhất)**

**Mục đích:** Biến một yêu cầu người dùng thành một bản kế hoạch kỹ thuật chi tiết, chính xác trước khi viết bất kỳ dòng code nào.

**Lệnh/Prompt Chi tiết (Ví dụ):**

```
@front-end/.github/prompts/plan_feature.prompt.md

Tạo một kế hoạch kỹ thuật chi tiết để triển khai tính năng sau: "Trang quản lý cho phép Admin xem danh sách các mã giảm giá (promotions), thêm, sửa, xóa mã giảm giá. Mỗi mã có tên, mô tả, phần trăm giảm giá, ngày bắt đầu và ngày kết thúc."
```

**Hướng dẫn sử dụng:**

- **Khi nào dùng:** Khi bạn bắt đầu một tính năng mới.
- **Cách hoạt động:** Lệnh này yêu cầu Gemini sử dụng mẫu từ `prompts/plan_feature.prompt.md` để tạo ra một file `PLAN.md`.
- **Kết quả mong đợi:** Một tài liệu kế hoạch chi tiết, liệt kê các tệp cần tạo/sửa (ví dụ: `src/features/promotions/hooks/usePromotions.ts`), cấu trúc dữ liệu trong `types.ts`, schema Zod trong `schemas.ts`, và logic chính của từng hàm.

#### **B. Xem xét và Tinh chỉnh Kế hoạch (Bước thủ công)**

**Mục đích:** Đảm bảo kế hoạch của Gemini là chính xác và phù hợp với yêu cầu của bạn trước khi triển khai. **Hãy dành phần lớn thời gian ở bước này.**

**Lệnh/Prompt Chi tiết (Ví dụ):**

```
Xem lại kế hoạch vừa tạo. Trong phần "Các Tệp và Hàm Liên quan", hãy đảm bảo hook `usePromotions` sử dụng `useQuery` của React Query và các hàm mutations (thêm, sửa, xóa) được đóng gói trong hook `usePromotionManagement`.
```

**Hướng dẫn sử dụng:**

- Đây là lúc bạn, với vai trò kỹ sư, kiểm tra lại kế hoạch.
- Hãy chắc chắn rằng các thư viện (React Query, Zustand), cấu trúc file, và tên gọi đều tuân thủ `instructions.md`.

#### **C. Triển khai theo Kế hoạch**

**Mục đích:** Tự động hóa việc viết code dựa trên bản kế hoạch đã được phê duyệt.

**Lệnh/Prompt Chi tiết:**

```
@prompts/implement_plan.prompt.md

Vui lòng triển khai kế hoạch kỹ thuật đã được tạo ở trên để xây dựng tính năng quản lý promotions.
```

**Hướng dẫn sử dụng:**

- **Khi nào dùng:** Sau khi bạn đã hoàn toàn hài lòng với bản kế hoạch.
- **Cách hoạt động:** Gemini sẽ đọc file `prompts/implement_plan.prompt.md` và tuân thủ 100% kế hoạch để tạo ra code cho tất cả các tệp đã được chỉ định.
- **Kết quả mong đợi:** Gemini sẽ cung cấp đầy đủ code cho các file mới hoặc các đoạn code cần cập nhật trong các file hiện có.

---

### **Bước 3: Đảm bảo Chất lượng và Gỡ lỗi (QA & Debugging)**

Sử dụng các lệnh này sau khi AI đã triển khai mã để kiểm tra, sửa lỗi và cải thiện chất lượng.

#### **A. Đánh giá Code (Code Review)**

**Mục đích:** Tìm kiếm các lỗi logic, vấn đề về kiến trúc, hoặc những điểm không tuân thủ quy ước mà AI có thể đã bỏ qua.

**Lệnh/Prompt Chi tiết:**

```
@prompts/code_review.prompt.md

Thực hiện đánh giá code toàn diện cho các file của tính năng "promotions" vừa được tạo, dựa trên kế hoạch kỹ thuật đã cung cấp.
```

**Hướng dấn sử dụng:**

- **Khi nào dùng:** Sau khi code đã được triển khai. **Nên thực hiện trong một chat mới** (nhưng vẫn cung cấp lại ngữ cảnh ở Bước 1 và kế hoạch) để có một cái nhìn khách quan.
- **Cách hoạt động:** Sử dụng mẫu trong `prompts/code_review.prompt.md` để kiểm tra chéo code và kế hoạch, tương tự như cách `docs/features/auth_REVIEW.md` đã được tạo.
- **Kết quả mong đợi:** Một file `REVIEW.md` liệt kê các vấn đề tìm thấy và đề xuất cải thiện.

#### **B. Tái cấu trúc và Sửa lỗi theo Review**

**Mục đích:** Chỉ thị cho Gemini tự động sửa các vấn đề được phát hiện trong quá trình review.

**Lệnh/Prompt Chi tiết:**

```
@prompts/refactor_code.prompt.md

Dựa trên các vấn đề được nêu trong file review, hãy tái cấu trúc lại component `PromotionForm.tsx`. Cụ thể là: [Dán vào vấn đề cụ thể, ví dụ: "Tách logic stateful và các hiệu ứng (effects) ra một custom hook `usePromotionForm` để tăng khả năng tái sử dụng."].
```

**Hướng dẫn sử dụng:**

- Dùng lệnh này trong cùng chat với `/code-review` để giữ ngữ cảnh.
- Sử dụng `prompts/refactor_code.prompt.md` để yêu cầu Gemini tập trung vào việc cải thiện cấu trúc bên trong mà không làm thay đổi chức năng.

#### **C. Giải thích Code để Gỡ lỗi**

**Mục đích:** Hiểu rõ một đoạn code phức tạp khi bạn gặp lỗi không mong muốn lúc chạy thử.

**Lệnh/Prompt Chi tiết:**

```
@prompts/explain_code.prompt.md

Giải thích chi tiết về cách hoạt động của hook `usePromotionManagement`. Tập trung vào luồng dữ liệu khi thực hiện một mutation và cách React Query xử lý việc cập nhật lại UI.
```

**Hướng dẫn sử dụng:**

- **Khi nào dùng:** Khi bạn đang cố gắng gỡ lỗi và cần hiểu sâu hơn về một đoạn code cụ thể.
- **Cách hoạt động:** Mẫu `prompts/explain_code.prompt.md` sẽ yêu cầu một lời giải thích toàn diện, từng bước, giúp bạn dễ dàng xác định điểm bất thường.

---

## **Tóm tắt Quy trình làm việc lý tưởng**

| Bước             | Hành động (Lệnh Prompt)             | Mục tiêu                                                | Tệp Prompt Liên quan       |
| :--------------- | :---------------------------------- | :------------------------------------------------------ | :------------------------- |
| **LẬP KẾ HOẠCH** | `@prompts/plan_feature.prompt.md`   | Chia vấn đề lớn thành các bước kỹ thuật chi tiết.       | `plan_feature.prompt.md`   |
| **XEM XÉT**      | (Thủ công)                          | Đảm bảo logic và công nghệ trong kế hoạch là chính xác. | -                          |
| **TRIỂN KHAI**   | `@prompts/implement_plan.prompt.md` | Tự động hóa việc tạo code, file và chỉnh sửa.           | `implement_plan.prompt.md` |
| **ĐÁNH GIÁ**     | `@prompts/code_review.prompt.md`    | Bắt các lỗi tinh vi mà AI thường mắc phải.              | `code_review.prompt.md`    |
| **SỬA LỖI**      | `@prompts/refactor_code.prompt.md`  | Áp dụng các đề xuất từ bước đánh giá.                   | `refactor_code.prompt.md`  |
| **HIỂU CODE**    | `@prompts/explain_code.prompt.md`   | Phân tích code phức tạp trong quá trình gỡ lỗi.         | `explain_code.prompt.md`   |
